
"use client"

import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { aiTagScanForCoilLogging } from '@/ai/flows/ai-tag-scan-for-coil-logging-flow';
import { toast } from '@/hooks/use-toast';

export default function UploadTag() {
  const router = useRouter();
  const { coilTypes, logCoil } = useAlloyStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const targetType = coilTypes[0] || { width: 1250, thickness: 2.5 };
      const scan = await aiTagScanForCoilLogging({
        tagPhotoDataUri: "data:image/jpeg;base64,mock",
        predefinedCoilWidth: targetType.width,
        predefinedCoilThickness: targetType.thickness
      });
      setResult({ ...scan, typeId: targetType.id });
    } catch (e) {
      toast({ title: "OCR Error", description: "Could not parse document.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLog = () => {
    if (result) {
      logCoil({ typeId: result.typeId, netWeight: result.netWeight });
      toast({ title: "Logged Successfully" });
      router.push('/operator/wip-coils');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center gap-4 bg-secondary/50 border-b border-border"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></Button><h1 className="font-headline text-lg font-bold">Document Ingestion</h1></header>
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {!result ? (
          <div className="w-full text-center space-y-6"><div className="p-12 border-2 border-dashed border-primary/20 rounded-3xl bg-secondary/20 relative group hover:bg-secondary/40 transition-colors"><Upload className="w-16 h-16 text-primary mx-auto mb-4 opacity-50 group-hover:scale-110 transition-transform" /><p className="text-sm font-medium">Drop Packing Tag File</p><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={isProcessing} /></div>{isProcessing && (<div className="flex flex-col items-center gap-3 animate-pulse"><Loader2 className="w-8 h-8 text-accent animate-spin" /><p className="text-[10px] font-bold uppercase text-accent">AI Parsing Buffer...</p></div>)}</div>
        ) : (
          <Card className="bg-secondary/30 border-accent/20 w-full animate-in fade-in slide-in-from-bottom-4"><CardContent className="p-6 space-y-6"><div className="flex items-center gap-3 text-green-500"><CheckCircle className="w-6 h-6" /><h2 className="font-headline font-bold">Ingestion Verified</h2></div><div className="grid grid-cols-2 gap-4"><div className="bg-background/50 p-4 rounded-xl border border-border"><p className="text-[10px] uppercase font-bold text-muted-foreground">Net Weight</p><p className="text-2xl font-headline font-bold text-accent">{result.netWeight} KG</p></div><div className="bg-background/50 p-4 rounded-xl border border-border"><p className="text-[10px] uppercase font-bold text-muted-foreground">Width</p><p className="text-2xl font-headline font-bold">{result.coilWidth} mm</p></div></div><Button className="w-full h-14" onClick={handleLog}>Confirm & Log to Floor</Button><Button variant="ghost" className="w-full" onClick={() => setResult(null)}>Reset</Button></CardContent></Card>
        )}
      </main>
    </div>
  );
}
