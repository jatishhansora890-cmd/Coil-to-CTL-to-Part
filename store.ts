
"use client"

import { useMemo, useEffect } from 'react';
import { 
  collection, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { 
  CoilType, 
  CTLType, 
  PartType, 
  WIPCoil, 
  WIPCTL, 
  WIPPart, 
  HistoryRecord 
} from './types';
import { calculateWeight } from './calculations';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function useAlloyStore() {
  const db = useFirestore();

  // Check if Firebase is actually configured
  useEffect(() => {
    const isMissingConfig = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                           process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "PLACEHOLDER";
    
    if (isMissingConfig) {
      toast({
        title: "⚠️ DATABASE NOT LINKED",
        description: "Your data will NOT be saved. Please add Environment Variables in Vercel to fix this.",
        variant: "destructive",
      });
    }
  }, []);

  const coilTypesRef = useMemo(() => db ? collection(db, 'coilTypes') : null, [db]);
  const ctlTypesRef = useMemo(() => db ? collection(db, 'ctlTypes') : null, [db]);
  const partTypesRef = useMemo(() => db ? collection(db, 'partTypes') : null, [db]);
  const wipCoilsRef = useMemo(() => db ? collection(db, 'wipCoils') : null, [db]);
  const wipCtlsRef = useMemo(() => db ? collection(db, 'wipCtls') : null, [db]);
  const historyRef = useMemo(() => db ? collection(db, 'history') : null, [db]);
  const historyQuery = useMemo(() => historyRef ? query(historyRef, orderBy('timestamp', 'desc')) : null, [historyRef]);

  const { data: coilTypes = [] } = useCollection<CoilType>(coilTypesRef);
  const { data: ctlTypes = [] } = useCollection<CTLType>(ctlTypesRef);
  const { data: partTypes = [] } = useCollection<PartType>(partTypesRef);
  const { data: wipCoils = [] } = useCollection<WIPCoil>(wipCoilsRef);
  const { data: wipCtls = [] } = useCollection<WIPCTL>(wipCtlsRef);
  const { data: history = [] } = useCollection<HistoryRecord>(historyQuery);

  const addHistory = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    if (!db) return;
    const historyDocRef = doc(collection(db, 'history'));
    setDoc(historyDocRef, {
      ...record,
      timestamp: serverTimestamp()
    }).catch((e) => {
      console.error("History Log Error:", e);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: historyDocRef.path,
        operation: 'create',
        requestResourceData: record
      }));
    });
  };

  const logCoil = (coil: Omit<WIPCoil, 'id' | 'loggedAt' | 'status' | 'currentWeight'>) => {
    if (!db) return;
    const coilId = `COIL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const coilDocRef = doc(db, 'wipCoils', coilId);
    
    const data = {
      id: coilId,
      ...coil,
      currentWeight: coil.netWeight,
      loggedAt: new Date().toISOString(),
      status: 'active' as const
    };

    setDoc(coilDocRef, data)
      .then(() => {
        addHistory({
          type: 'coil_log',
          description: `Coil Entry: ${coil.netWeight} KG recorded`,
          details: { toId: coilId, toWeight: coil.netWeight }
        });
      })
      .catch((e) => {
        console.error("Coil Log Error:", e);
        toast({ title: "Save Failed", description: "Is your database in Test Mode?", variant: "destructive" });
      });
  };

  const produceCTL = (
    ctl: Omit<WIPCTL, 'id' | 'loggedAt'>, 
    balance: { 
      totalScrapWeight: number, 
      totalCtlWeight: number, 
      phantomWeight: number, 
      startWeight: number, 
      endWeight: number,
      isExhausted: boolean 
    }
  ) => {
    if (!db) return;

    const ctlId = `CTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const ctlDocRef = doc(db, 'wipCtls', ctlId);
    const coilRef = doc(db, 'wipCoils', ctl.coilId);

    updateDoc(coilRef, { 
      currentWeight: balance.endWeight,
      status: balance.isExhausted ? 'exhausted' : 'active'
    });

    const ctlData = {
      id: ctlId,
      ...ctl,
      loggedAt: new Date().toISOString()
    };

    setDoc(ctlDocRef, ctlData).then(() => {
      addHistory({
        type: 'ctl_production',
        description: `Produced ${ctl.count} Nos from ${ctl.coilId.slice(-6)}`,
        details: {
          fromId: ctl.coilId,
          toId: ctlId,
          fromWeight: balance.startWeight,
          toWeight: balance.totalCtlWeight,
          scrapWeight: balance.totalScrapWeight,
          phantomWeight: balance.phantomWeight,
          remainingWeight: balance.endWeight,
          toCount: ctl.count
        }
      });
    }).catch(e => console.error("CTL Production Error:", e));
  };

  const producePart = (part: Omit<WIPPart, 'id' | 'loggedAt'>) => {
    if (!db) return;

    const partId = `PART-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const sourceCtl = wipCtls.find(c => c.id === part.ctlId);
    
    if (sourceCtl) {
      updateDoc(doc(db, 'wipCtls', part.ctlId), { count: sourceCtl.count - part.count });
    }

    const partDocRef = doc(db, 'wipParts', partId);
    const partData = {
      id: partId,
      ...part,
      loggedAt: new Date().toISOString()
    };

    setDoc(partDocRef, partData).then(() => {
      addHistory({
        type: 'part_production',
        description: `Produced ${part.count} Parts from CTL batch`,
        details: {
          fromId: part.ctlId,
          toId: partId,
          fromCount: part.count,
          toCount: part.count
        }
      });
    }).catch(e => console.error("Part Production Error:", e));
  };

  const updateCoilType = (id: string, updates: Partial<CoilType>) => {
    if (!db) return;
    updateDoc(doc(db, 'coilTypes', id), updates);
  };

  const deleteCoilType = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'coilTypes', id));
  };

  const addCoilType = (type: Omit<CoilType, 'id'>) => {
    if (!db) return;
    const docRef = doc(collection(db, 'coilTypes'));
    setDoc(docRef, type);
  };

  const updateCTLType = (id: string, updates: Partial<CTLType>) => {
    if (!db) return;
    const unitWeight = calculateWeight(updates.length || 0, updates.width || 0, updates.thickness || 0);
    const unitScrapWeight = calculateWeight(updates.scrapLength || 0, updates.scrapWidth || 0, updates.scrapThickness || 0);
    updateDoc(doc(db, 'ctlTypes', id), { ...updates, unitWeight, unitScrapWeight });
  };

  const deleteCTLType = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'ctlTypes', id));
  };

  const addCTLType = (type: Omit<CTLType, 'id' | 'unitWeight' | 'unitScrapWeight'>) => {
    if (!db) return;
    const unitWeight = calculateWeight(type.length, type.width, type.thickness);
    const unitScrapWeight = calculateWeight(type.scrapLength, type.scrapWidth, type.scrapThickness);
    const docRef = doc(collection(db, 'ctlTypes'));
    setDoc(docRef, { ...type, unitWeight, unitScrapWeight });
  };

  const updatePartType = (id: string, updates: Partial<PartType>) => {
    if (!db) return;
    updateDoc(doc(db, 'partTypes', id), updates);
  };

  const deletePartType = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'partTypes', id));
  };

  const addPartType = (type: Omit<PartType, 'id'>) => {
    if (!db) return;
    const docRef = doc(collection(db, 'partTypes'));
    setDoc(docRef, type);
  };

  const deleteHistoryRecord = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'history', id));
  };

  return {
    coilTypes,
    ctlTypes,
    partTypes,
    wipCoils,
    wipCtls,
    history,
    logCoil,
    produceCTL,
    producePart,
    updateCoilType,
    deleteCoilType,
    addCoilType,
    updateCTLType,
    deleteCTLType,
    addCTLType,
    updatePartType,
    deletePartType,
    addPartType,
    deleteHistoryRecord
  };
}
