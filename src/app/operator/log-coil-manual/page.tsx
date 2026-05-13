
"use client"

import React, { useState } from 'react';
import { ArrowLeft, Database, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function LogCoilManual() {
  const router = useRouter();
  const { coilTypes, logCoil } = useAlloyStore();
  
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [netWeight, setNetWeight] = useState<string>('');

  const handleSave = () => {
    if (selectedTypeId && netWeight) {
      logCoil({
        typeId: selectedTypeId,
        netWeight: parseFloat(netWeight)
      });
      toast({ title: "Inventory Updated", description: "Manual log successful." });
      router.push('/operator/wip-coils');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center gap-4 bg-secondary/50 border-b border-border"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></Button><h1 className="font-headline text-lg font-bold">Manual Log Entry</h1></header>
      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6">
        <Card className="bg-secondary/30 border-border"><CardHeader><CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-muted-foreground"><Database className="w-4 h-4" /> Dimension Specs</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><label className="text-[10px] uppercase font-bold text-muted-foreground">Master Standard</label><Select onValueChange={setSelectedTypeId}><SelectTrigger className="h-12"><SelectValue placeholder="Select type..." /></SelectTrigger><SelectContent>{coilTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.width}mm x {type.thickness}mm</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><label className="text-[10px] uppercase font-bold text-muted-foreground">Scale Weight (KG)</label><Input type="number" placeholder="0.00" className="h-12 text-lg font-headline font-bold" value={netWeight} onChange={(e) => setNetWeight(e.target.value)} /></div>
          <Button className="w-full h-14 mt-4" disabled={!selectedTypeId || !netWeight} onClick={handleSave}><Save className="w-5 h-5 mr-2" /> Commit to Floor WIP</Button>
        </CardContent></Card>
      </main>
    </div>
  );
}
