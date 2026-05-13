
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { aiTagScanForCoilLogging } from '@/ai/flows/ai-tag-scan-for-coil-logging-flow';
import { aiMaterialTypeRecognition } from '@/ai/flows/ai-material-type-recognition';
import { toast } from '@/hooks/use-toast';

export default function ScanScreen() {
  const router = useRouter();
  const { coilTypes, logCoil } = useAlloyStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      toast({ title: "Camera Error", description: "Access denied or not found.", variant: "destructive" });
    }
  };

  const captureAndScan = async () => {
    setIsScanning(true);
    setPhoto("https://picsum.photos/seed/scan-preview/600/400");
    const mockPhotoData = "data:image/jpeg;base64,mockdata"; 

    try {
      const typeRecognition = await aiMaterialTypeRecognition({ tagImageDataUri: mockPhotoData });
      if (typeRecognition.materialType === 'coil') {
        const targetType = coilTypes[0] || { width: 1250, thickness: 2.5 };
        const scan = await aiTagScanForCoilLogging({
          tagPhotoDataUri: mockPhotoData,
          predefinedCoilWidth: targetType.width,
          predefinedCoilThickness: targetType.thickness
        });
        setScanResult({ ...scan, typeId: targetType.id || 'c1', materialType: 'coil' });
      } else {
        toast({ title: "CTL Tag Detected", description: "AI suggests this is already a CTL sheet." });
      }
    } catch (e) {
      toast({ title: "Scan Failed", description: "AI vision timeout.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLog = () => {
    if (scanResult && scanResult.isValid) {
      logCoil({ typeId: scanResult.typeId, netWeight: scanResult.netWeight });
      toast({ title: "Coil Logged" });
      router.push('/operator/wip-coils');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center gap-4 bg-secondary/50"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-6 h-6" /></Button><h1 className="font-headline text-lg font-bold">Industrial AI Vision</h1></header>
      <main className="flex-1 p-6 flex flex-col items-center">
        {!photo ? (
          <div className="relative w-full aspect-[3/4] max-w-sm rounded-3xl overflow-hidden bg-black border-2 border-primary/20"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" /><div className="absolute inset-0 border-2 border-accent/30 m-8 rounded-xl pointer-events-none flex items-center justify-center"><div className="w-full h-0.5 bg-accent/50 animate-pulse absolute" /></div><div className="absolute bottom-8 left-0 right-0 flex justify-center"><Button onClick={captureAndScan} className="w-20 h-20 rounded-full bg-accent border-8 border-background p-0"><Camera className="w-8 h-8 text-black" /></Button></div></div>
        ) : (
          <div className="w-full max-w-sm space-y-6"><Card className="bg-secondary/50 border-primary/20 overflow-hidden"><img src={photo} alt="Captured" className="w-full aspect-video object-cover" /><CardContent className="p-6">{isScanning ? (<div className="flex flex-col items-center py-8 gap-4"><Loader2 className="w-10 h-10 text-accent animate-spin" /><p className="font-headline text-sm animate-pulse">ANALYZING TAG...</p></div>) : scanResult ? (<div className="space-y-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground uppercase">Net Weight</p><p className="text-3xl font-headline font-bold text-accent">{scanResult.netWeight} <span className="text-sm font-normal">KG</span></p></div><div className={`p-1 rounded-full ${scanResult.isValid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>{scanResult.isValid ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}</div></div><div className="grid grid-cols-2 gap-4 pt-4 border-t border-border"><div><p className="text-[10px] text-muted-foreground uppercase">Width</p><p className="font-headline font-bold">{scanResult.coilWidth} mm</p></div><div><p className="text-[10px] text-muted-foreground uppercase">Thickness</p><p className="font-headline font-bold">{scanResult.coilThickness} mm</p></div></div><p className={`text-xs p-3 rounded-lg ${scanResult.isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{scanResult.validationMessage}</p><div className="flex gap-3 pt-4"><Button variant="outline" className="flex-1" onClick={() => { setPhoto(null); setScanResult(null); startCamera(); }}><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button><Button className="flex-1 bg-primary text-white" disabled={!scanResult.isValid} onClick={handleLog}>Log Coil</Button></div></div>) : null}</CardContent></Card></div>
        )}
      </main>
    </div>
  );
}
