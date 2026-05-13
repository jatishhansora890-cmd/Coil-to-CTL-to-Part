
"use client"

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Info, ArrowRight, Layers, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlloyStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ProduceCTL() {
  const router = useRouter();
  const { coilId } = useParams();
  const { wipCoils, ctlTypes, produceCTL } = useAlloyStore();
  
  const coil = wipCoils.find(c => c.id === coilId);
  const filteredCtlTypes = ctlTypes.filter(t => t.coilTypeId === coil?.typeId);
  
  const [selectedCtlTypeId, setSelectedCtlTypeId] = useState<string>('');
  const [productionCount, setProductionCount] = useState<string>('');

  const [balance, setBalance] = useState<{
    totalCtlWeight: number;
    totalScrapWeight: number;
    phantomWeight: number;
    startWeight: number;
    endWeight: number;
    isExhausted: boolean;
  } | null>(null);

  useEffect(() => {
    if (selectedCtlTypeId && productionCount && coil) {
      const type = ctlTypes.find(t => t.id === selectedCtlTypeId);
      if (type) {
        const count = parseInt(productionCount) || 0;
        const totalCtlWeight = count * (type.unitWeight || 0);
        const totalScrapWeight = count * (type.unitScrapWeight || 0);
        const standardUsage = totalCtlWeight + totalScrapWeight;
        
        let phantom = 0;
        let endWeight = coil.currentWeight - standardUsage;
        let isExhausted = false;

        // Auto-exhaustion logic: If calculated usage is >= current WIP, it's the final batch
        if (standardUsage >= coil.currentWeight) {
          phantom = coil.currentWeight - standardUsage;
          endWeight = 0;
          isExhausted = true;
        }

        setBalance({
          totalCtlWeight,
          totalScrapWeight,
          phantomWeight: phantom,
          startWeight: coil.currentWeight,
          endWeight: Math.max(0, endWeight),
          isExhausted
        });
      }
    } else {
      setBalance(null);
    }
  }, [selectedCtlTypeId, productionCount, coil, ctlTypes]);

  const handleProcess = () => {
    if (balance && coil && selectedCtlTypeId) {
      const countNum = parseInt(productionCount) || 0;
      
      produceCTL({
        coilId: coil.id,
        typeId: selectedCtlTypeId,
        count: countNum
      }, balance);
      
      toast({ 
        title: balance.isExhausted ? "Coil Exhausted" : "Batch Logged", 
        description: balance.isExhausted 
          ? `Final balance closed with ${balance.phantomWeight.toFixed(2)} KG variance.` 
          : `WIP Adjusted. Remaining: ${balance.endWeight.toFixed(2)} KG` 
      });
      
      router.push('/operator/wip-coils');
    }
  };

  if (!coil) return <div className="p-8 text-center flex flex-col items-center gap-4"><Info className="w-12 h-12 text-muted-foreground opacity-20" /><p>Source material not found.</p><Button variant="outline" onClick={() => router.push('/operator/wip-coils')}>Return to List</Button></div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center gap-4 bg-secondary/50 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></Button>
        <h1 className="font-headline text-lg font-bold">Log Production Batch</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active WIP Mass</p>
                <p className="text-2xl font-headline font-bold text-accent">{coil.currentWeight.toFixed(2)} KG</p>
                <p className="text-[10px] text-muted-foreground italic">Source: {coil.id.slice(-8)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-headline font-bold">{(coil.netWeight - coil.currentWeight).toFixed(2)} KG</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Previously Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">CTL Specification</label>
            <Select value={selectedCtlTypeId} onValueChange={setSelectedCtlTypeId}>
              <SelectTrigger className="h-14 bg-secondary"><SelectValue placeholder="Select output size..." /></SelectTrigger>
              <SelectContent>
                {filteredCtlTypes.length > 0 ? (
                  filteredCtlTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.description} ({type.length}x{type.width}mm)</SelectItem>))
                ) : (
                  <SelectItem value="none" disabled>No specs for this coil width</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Production Count (Nos)</label>
            <Input type="number" className="h-14 text-2xl bg-secondary font-headline border-border focus:border-accent" placeholder="0" value={productionCount} onChange={(e) => setProductionCount(e.target.value)} />
          </div>
        </div>

        {balance && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Estimated WIP Mass</p>
                <p className="text-lg font-bold text-primary">{balance.totalCtlWeight.toFixed(2)} KG</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1">Estimated Scrap</p>
                <p className="text-lg font-bold text-destructive">{balance.totalScrapWeight.toFixed(2)} KG</p>
              </div>
            </div>

            <Card className={`border-2 ${balance.isExhausted ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-secondary/10'}`}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Residual WIP Post-Batch</p>
                  <p className={`text-2xl font-bold ${balance.isExhausted ? 'text-amber-500' : 'text-white'}`}>
                    {balance.endWeight.toFixed(2)} KG
                  </p>
                </div>
                {balance.isExhausted && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-amber-500 flex items-center justify-end gap-1">
                      <Calculator className="w-3 h-3" /> Final Variance
                    </p>
                    <p className="text-lg font-bold text-amber-500">{balance.phantomWeight.toFixed(2)} KG</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              className={`w-full h-16 text-xl font-bold rounded-2xl shadow-xl transition-all group ${balance.isExhausted ? 'bg-amber-600 hover:bg-amber-500' : 'bg-primary hover:bg-primary/90'}`}
              onClick={handleProcess}
            >
              <Layers className="w-6 h-6 mr-2 group-hover:rotate-12" /> 
              {balance.isExhausted ? 'Exhaust Coil & Commit' : 'Commit Production Log'} 
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
