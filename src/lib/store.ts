
"use client"

import { useMemo } from 'react';
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

export function useAlloyStore() {
  const db = useFirestore();

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
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: historyDocRef.path,
        operation: 'create',
        requestResourceData: record
      }));
    });
  };

  const logCoil = (coil: Omit<WIPCoil, 'id' | 'loggedAt' | 'status' | 'currentWeight'>) => {
    if (!db) return;
    const coilDocRef = doc(collection(db, 'wipCoils'));
    const data = {
      ...coil,
      currentWeight: coil.netWeight,
      loggedAt: serverTimestamp(),
      status: 'active' as const
    };
    setDoc(coilDocRef, data).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: coilDocRef.path,
        operation: 'create',
        requestResourceData: data
      }));
    });
    
    addHistory({
      type: 'coil_log',
      description: `Coil Entry: ${coil.netWeight} KG scale recorded`,
      details: { toId: coilDocRef.id, toWeight: coil.netWeight }
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

    // 1. Deduct usage from parent coil
    const coilRef = doc(db, 'wipCoils', ctl.coilId);
    updateDoc(coilRef, { 
      currentWeight: balance.endWeight,
      status: balance.isExhausted ? 'exhausted' : 'active'
    });

    // 2. Create the physical CTL inventory
    const ctlDocRef = doc(collection(db, 'wipCtls'));
    const ctlData = {
      ...ctl,
      loggedAt: serverTimestamp()
    };
    setDoc(ctlDocRef, ctlData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: ctlDocRef.path,
        operation: 'create',
        requestResourceData: ctlData
      }));
    });

    // 3. Log Audit Record
    addHistory({
      type: 'ctl_production',
      description: `Production: ${ctl.count} Nos (${balance.isExhausted ? 'Final' : 'Partial'} Batch)`,
      details: {
        fromId: ctl.coilId,
        toId: ctlDocRef.id,
        fromWeight: balance.startWeight,
        toWeight: balance.totalCtlWeight,
        scrapWeight: balance.totalScrapWeight,
        phantomWeight: balance.phantomWeight,
        remainingWeight: balance.endWeight,
        toCount: ctl.count
      }
    });
  };

  const producePart = (part: Omit<WIPPart, 'id' | 'loggedAt'>) => {
    if (!db) return;

    const sourceCtl = wipCtls.find(c => c.id === part.ctlId);
    if (sourceCtl) {
      updateDoc(doc(db, 'wipCtls', part.ctlId), { count: sourceCtl.count - part.count });
    }

    const partDocRef = doc(collection(db, 'wipParts'));
    const partData = {
      ...part,
      loggedAt: serverTimestamp()
    };
    setDoc(partDocRef, partData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: partDocRef.path,
        operation: 'create',
        requestResourceData: partData
      }));
    });

    addHistory({
      type: 'part_production',
      description: `Part Log: ${part.count} Units Produced from ${part.ctlId}`,
      details: {
        fromId: part.ctlId,
        toId: partDocRef.id,
        fromCount: part.count,
        toCount: part.count
      }
    });
  };

  // Master Data CRUD
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
    const length = updates.length ?? 0;
    const width = updates.width ?? 0;
    const thickness = updates.thickness ?? 0;
    const scrapLength = updates.scrapLength ?? 0;
    const scrapWidth = updates.scrapWidth ?? 0;
    const scrapThickness = updates.scrapThickness ?? 0;

    const unitWeight = calculateWeight(length, width, thickness);
    const unitScrapWeight = calculateWeight(scrapLength, scrapWidth, scrapThickness);
    updateDoc(doc(db, 'ctlTypes', id), { 
      ...updates, 
      unitWeight, 
      unitScrapWeight 
    });
  };

  const deleteCTLType = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'ctlTypes', id));
  };

  const addCTLType = (type: Omit<CTLType, 'id' | 'unitWeight' | 'unitScrapWeight'>) => {
    if (!db) return;
    const unitWeight = calculateWeight(type.length, type.width, type.thickness) || 0;
    const unitScrapWeight = calculateWeight(type.scrapLength, type.scrapWidth, type.scrapThickness) || 0;
    const docRef = doc(collection(db, 'ctlTypes'));
    setDoc(docRef, { 
      ...type, 
      unitWeight, 
      unitScrapWeight 
    });
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
