
export type CoilType = {
  id: string;
  width: number;
  thickness: number;
};

export type CTLType = {
  id: string;
  coilTypeId: string;
  length: number;
  width: number;
  thickness: number;
  description: string;
  scrapLength: number;
  scrapWidth: number;
  scrapThickness: number;
  unitWeight: number;
  unitScrapWeight: number;
};

export type PartType = {
  id: string;
  ctlTypeId: string;
  name: string;
  sku: string;
};

export type WIPCoil = {
  id: string;
  typeId: string;
  netWeight: number;
  currentWeight: number; // Added to track running WIP balance
  loggedAt: any;
  status: 'active' | 'exhausted';
};

export type WIPCTL = {
  id: string;
  typeId: string;
  coilId: string;
  count: number;
  loggedAt: any;
};

export type WIPPart = {
  id: string;
  typeId: string;
  ctlId: string;
  count: number;
  loggedAt: any;
};

export type HistoryRecord = {
  id: string;
  type: 'coil_log' | 'ctl_production' | 'part_production' | 'data_edit' | 'scrap_dispose';
  description: string;
  timestamp: any;
  details: {
    fromId?: string;
    toId?: string;
    fromWeight?: number;
    toWeight?: number;
    scrapWeight?: number;
    phantomWeight?: number;
    fromCount?: number;
    toCount?: number;
    [key: string]: any;
  };
};
