
"use client"

import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, History, Layers, Pencil, Trash, Plus, FileText, Database, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlloyStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const router = useRouter();
  const { 
    coilTypes, ctlTypes, partTypes, history,
    updateCoilType, deleteCoilType, addCoilType,
    updateCTLType, deleteCTLType, addCTLType,
    updatePartType, deletePartType, addPartType,
    deleteHistoryRecord 
  } = useAlloyStore();

  const [editCoil, setEditCoil] = useState<any>(null);
  const [editCTL, setEditCTL] = useState<any>(null);
  const [editPart, setEditPart] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-6 bg-secondary/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-headline text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary w-6 h-6" /> Production Audit
            </h1>
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Master Audit & Configuration</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-secondary p-1 grid grid-cols-2 max-w-sm mx-auto">
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" /> Production Log
            </TabsTrigger>
            <TabsTrigger value="master">
              <Layers className="w-4 h-4 mr-2" /> Master Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="bg-secondary/30 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Mass Balance History</CardTitle>
                <CardDescription>Real-time audit of material transitions and variance detection</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Traceability</TableHead>
                      <TableHead>Mass Data (KG)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length > 0 ? (
                      history.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="text-[10px] text-muted-foreground">
                            {record.timestamp?.seconds ? new Date(record.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold text-accent border-accent/30">
                              {record.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-[11px] font-mono">
                              {record.details?.fromId && <span className="text-muted-foreground">{record.details.fromId.slice(-6)} → </span>}
                              <span className="text-primary font-bold">{record.details?.toId ? record.details.toId.slice(-6) : 'NEW'}</span>
                            </div>
                            {record.details?.toCount && <div className="text-[9px] text-accent">Yield: {record.details.toCount} Nos</div>}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-[10px]">
                              {record.details?.fromWeight !== undefined && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground uppercase">WIP Pre:</span>
                                  <span className="font-bold">{record.details.fromWeight.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between gap-4 text-primary">
                                <span className="uppercase">Net Product:</span>
                                <span className="font-bold">{record.details?.toWeight?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-destructive">
                                <span className="uppercase">Net Scrap:</span>
                                <span className="font-bold">{record.details?.scrapWeight?.toFixed(2) || '0.00'}</span>
                              </div>
                              {record.details?.phantomWeight !== undefined && record.details.phantomWeight !== 0 && (
                                <div className="flex justify-between gap-4 text-amber-500 bg-amber-500/5 px-1 rounded">
                                  <span className="uppercase">Variance:</span>
                                  <span className="font-bold">{record.details.phantomWeight.toFixed(2)}</span>
                                </div>
                              )}
                              {record.details?.remainingWeight !== undefined && (
                                <div className="flex justify-between gap-4 border-t border-border/50 pt-1 mt-1 font-bold">
                                  <span className="text-muted-foreground uppercase">WIP Post:</span>
                                  <span className="text-white">{record.details.remainingWeight.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteHistoryRecord(record.id)}>
                              <Trash className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="master" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Coils Table */}
              <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase">1. Raw Coils</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditCoil({ width: '', thickness: '' })}><Plus className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {coilTypes.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-bold">{c.width} x {c.thickness}mm</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setEditCoil(c)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoilType(c.id)}><Trash className="w-3 h-3" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* CTL Specs Table */}
              <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <CardTitle className="text-sm font-bold uppercase">2. CTL Specs</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditCTL({ coilTypeId: '', description: '', length: '', width: '', thickness: '', scrapLength: '', scrapWidth: '', scrapThickness: '' })}><Plus className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {ctlTypes.map(ctl => (
                        <TableRow key={ctl.id}>
                          <TableCell>
                            <div className="text-xs font-bold">{ctl.description}</div>
                            <div className="text-[10px] text-muted-foreground">{ctl.length}x{ctl.width}x{ctl.thickness}mm</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setEditCTL(ctl)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCTLType(ctl.id)}><Trash className="w-3 h-3" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Parts Table */}
              <Card className="bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase">3. Part IDs</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditPart({ ctlTypeId: '', name: '', sku: '' })}><Plus className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {partTypes.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="text-xs font-bold">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground">SKU: {p.sku}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setEditPart(p)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePartType(p.id)}><Trash className="w-3 h-3" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <Dialog open={!!editCoil} onOpenChange={() => setEditCoil(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Coil Standard</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="number" placeholder="Width (mm)" value={editCoil?.width} onChange={e => setEditCoil({ ...editCoil, width: e.target.value })} />
            <Input type="number" step="0.01" placeholder="Thickness (mm)" value={editCoil?.thickness} onChange={e => setEditCoil({ ...editCoil, thickness: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => { 
              const data = { width: parseFloat(editCoil.width), thickness: parseFloat(editCoil.thickness) };
              if (editCoil.id) updateCoilType(editCoil.id, data); else addCoilType(data as any); setEditCoil(null); 
            }}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCTL} onOpenChange={() => setEditCTL(null)}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader><DialogTitle>CTL Specification</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={editCTL?.coilTypeId} onValueChange={val => setEditCTL({ ...editCTL, coilTypeId: val })}>
                <SelectTrigger><SelectValue placeholder="Select Parent Coil Ref..." /></SelectTrigger>
                <SelectContent>{coilTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.width}x{c.thickness}mm</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Description" value={editCTL?.description} onChange={e => setEditCTL({ ...editCTL, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">L (mm)</label><Input type="number" value={editCTL?.length} onChange={e => setEditCTL({ ...editCTL, length: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">W (mm)</label><Input type="number" value={editCTL?.width} onChange={e => setEditCTL({ ...editCTL, width: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">T (mm)</label><Input type="number" step="0.01" value={editCTL?.thickness} onChange={e => setEditCTL({ ...editCTL, thickness: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">Scrap L</label><Input type="number" value={editCTL?.scrapLength} onChange={e => setEditCTL({ ...editCTL, scrapLength: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">Scrap W</label><Input type="number" value={editCTL?.scrapWidth} onChange={e => setEditCTL({ ...editCTL, scrapWidth: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold">Scrap T</label><Input type="number" step="0.01" value={editCTL?.scrapThickness} onChange={e => setEditCTL({ ...editCTL, scrapThickness: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { 
              const data = { 
                ...editCTL, 
                length: parseFloat(editCTL.length), width: parseFloat(editCTL.width), thickness: parseFloat(editCTL.thickness),
                scrapLength: parseFloat(editCTL.scrapLength), scrapWidth: parseFloat(editCTL.scrapWidth), scrapThickness: parseFloat(editCTL.scrapThickness)
              };
              if (editCTL.id) updateCTLType(editCTL.id, data); else addCTLType(data as any); setEditCTL(null); 
            }}>Commit Specification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPart} onOpenChange={() => setEditPart(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Part Specification</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={editPart?.ctlTypeId} onValueChange={val => setEditPart({ ...editPart, ctlTypeId: val })}>
              <SelectTrigger><SelectValue placeholder="Select Source CTL..." /></SelectTrigger>
              <SelectContent>{ctlTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.description}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Component Name" value={editPart?.name} onChange={e => setEditPart({ ...editPart, name: e.target.value })} />
            <Input placeholder="Global SKU" value={editPart?.sku} onChange={e => setEditPart({ ...editPart, sku: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => { if (editPart.id) updatePartType(editPart.id, editPart); else addPartType(editPart); setEditPart(null); }}>Save Part ID</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
