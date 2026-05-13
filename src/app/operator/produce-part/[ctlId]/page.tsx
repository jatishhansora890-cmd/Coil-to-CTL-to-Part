
"use client"

import React, { useState } from 'react';
import { ArrowLeft, Hammer, Info, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlloyStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function ProducePart() {
  const router = useRouter();
  const { ctlId } = useParams();
  const { wipCtls, ctlTypes, partTypes, producePart } = useAlloyStore();
  
  const ctl = wipCtls.find(c => c.id === ctlId);
  const ctlType = ctlTypes.find(t => t.id === ctl?.typeId);
  const filteredPartTypes = partTypes.filter(t => t.ctlTypeId === ctl?.typeId);
  
  const [selectedPartTypeId, setSelectedPartTypeId] = useState<string>('');
  const [productionCount, setProductionCount] = useState<string>('');

  const handleProcess = () => {
    const countNum = parseInt(productionCount);
    if (ctl && selectedPartTypeId && countNum > 0) {
      if (countNum > ctl.count) {
        toast({ title: "Invalid Count", description: "Exceeds available CTL nos", variant: "destructive" });
        return;
      }
      producePart({ ctlId: ctl.id, typeId: selectedPartTypeId, count: countNum });
      toast({ title: "Production Logged" });
      router.push('/operator/wip-ctls');
    }
  };

  if (!ctl) return <div className="p-8 text-center flex flex-col items-center gap-4"><Info className="w-12 h-12 text-muted-foreground opacity-20" /><p>CTL batch not found.</p><Button variant="outline" onClick={() => router.push('/operator/wip-ctls')}>Return to List</Button></div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center gap-4 bg-secondary/50 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></Button>
        <h1 className="font-headline text-lg font-bold">CTL to Part</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        <Card className="bg-secondary/30 border-accent/20">
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-4 h-4 text-accent" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Source Material (CTL)</p>
            </div>
            <p className="text-lg font-headline font-bold text-white">{ctlType?.description || 'Standard CTL'}</p>
            <p className="text-[10px] text-muted-foreground">Spec: {ctlType?.length}x{ctlType?.width}x{ctlType?.thickness}mm</p>
            <p className="text-[10px] text-muted-foreground font-mono">Batch: {ctl.id}</p>
            
            <div className="mt-4 p-4 bg-background/50 rounded-xl flex justify-between items-center border border-border">
              <span className="text-xs text-muted-foreground uppercase font-bold">Available Stock</span>
              <span className="text-3xl font-headline font-bold text-accent">{ctl.count} <span className="text-xs font-normal text-muted-foreground">Nos</span></span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Target Part Specification</label>
            <Select onValueChange={setSelectedPartTypeId}>
              <SelectTrigger className="h-14 bg-secondary">
                <SelectValue placeholder="Select Part ID / Name..." />
              </SelectTrigger>
              <SelectContent>{filteredPartTypes.length > 0 ? (
                filteredPartTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.name} ({type.sku})</SelectItem>))
              ) : (
                <SelectItem value="none" disabled>No parts defined for this CTL</SelectItem>
              )}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Produced Quantity</label>
            <Input type="number" className="h-14 text-3xl font-headline bg-secondary" placeholder="0" value={productionCount} onChange={(e) => setProductionCount(e.target.value)} />
          </div>
        </div>

        <Button className="w-full h-16 bg-accent text-black font-bold text-lg mt-4 shadow-lg shadow-accent/10 group" disabled={!selectedPartTypeId || !productionCount} onClick={handleProcess}>
          <Hammer className="w-6 h-6 mr-2 group-hover:-rotate-12 transition-transform" /> Commit Part Log
        </Button>
      </main>
    </div>
  );
}
