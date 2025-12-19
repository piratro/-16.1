
export type StockStatus = 'Available' | 'Maintenance' | 'On Trip' | 'Retired';
export type StockType = 'Locomotive' | 'Passenger Carriage' | 'Freight Wagon';

export interface RollingStock {
    id: string;
    name: string;
    type: StockType;
    status: StockStatus;
    capacity: number; // For passenger or freight (tons)
    lastMaintenance: string;
}

export interface Trip {
    id: string;
    trainId: string; // Internal identifier for the trip
    route: string;
    departureTime: string;
    arrivalTime: string;
    assignedStockIds: string[];
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface User {
    id: string;
    username: string;
    role: 'Admin' | 'Manager' | 'Viewer';
}
