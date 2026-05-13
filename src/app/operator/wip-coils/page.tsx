
"use client"

import React from 'react';
import { ArrowLeft, Plus, Search, Scissors, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function WIPCoilsList() {
  const router = useRouter();
  const { wipCoils, coilTypes } = useAlloyStore();

  const getCoilType = (typeId: string) => coilTypes.find(t => t.id === typeId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="font-headline text-lg font-bold">WIP Coils</h1>
        </div>
        <Button size="icon" className="bg-primary text-white" onClick={() => router.push('/operator/scan')}>
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search Coil ID..." className="pl-10 bg-secondary border-border" />
        </div>
      </div>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {wipCoils.filter(c => c.status === 'active').length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Info className="w-12 h-12 opacity-20" />
            <p>No active coils in inventory</p>
          </div>
        ) : (
          wipCoils.filter(c => c.status === 'active').map((coil) => {
            const type = getCoilType(coil.typeId);
            return (
              <Card key={coil.id} className="bg-secondary/30 border-primary/10 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline text-accent font-bold tracking-tight">{coil.id}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase">Logged: {new Date(coil.loggedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-headline font-bold">{coil.netWeight} <span className="text-xs font-normal">KG</span></p>
                      <p className="text-[10px] text-muted-foreground uppercase">Net Weight</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 bg-background/50 rounded-lg mb-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Width</p>
                      <p className="text-sm font-bold">{type?.width} mm</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Thickness</p>
                      <p className="text-sm font-bold">{type?.thickness} mm</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    onClick={() => router.push(`/operator/produce-ctl/${coil.id}`)}
                  >
                    <Scissors className="w-4 h-4 mr-2" /> Start CTL Production
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
