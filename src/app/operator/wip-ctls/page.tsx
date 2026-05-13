
"use client"

import React from 'react';
import { ArrowLeft, Package, Hammer, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function WIPCTLsList() {
  const router = useRouter();
  const { wipCtls, ctlTypes } = useAlloyStore();

  const getCtlType = (typeId: string) => ctlTypes.find(t => t.id === typeId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center bg-secondary/50 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="font-headline text-lg font-bold ml-4">WIP CTL Inventory</h1>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {wipCtls.filter(c => c.count > 0).length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Package className="w-12 h-12 opacity-20" />
            <p>No processed CTLs available</p>
          </div>
        ) : (
          wipCtls.filter(c => c.count > 0).map((ctl) => {
            const type = getCtlType(ctl.typeId);
            return (
              <Card key={ctl.id} className="bg-secondary/30 border-accent/10 hover:border-accent/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline text-accent font-bold tracking-tight">{ctl.id}</h3>
                      <p className="text-sm font-medium">{type?.description}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Source Coil: {ctl.coilId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-headline font-bold text-white">{ctl.count}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Available Nos</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 bg-background/50 rounded-lg mb-4 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Dims</p>
                      <p className="font-bold">{type?.length}x{type?.width}x{type?.thickness} mm</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-accent text-black font-bold hover:bg-accent/90"
                    onClick={() => router.push(`/operator/produce-part/${ctl.id}`)}
                  >
                    <Hammer className="w-4 h-4 mr-2" /> Produce Parts
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  );
}
