export interface Location {
  latitude: number;
  longitude: number;
}

export interface Scooter {
  id: string;
  battery: number;
  mac_address: string;
  serial_number: string;
  status: 'AVAILABLE' | 'CHARGING' | 'MAINTENANCE' | 'OCCUPIED';
  location: Location;
}

export interface ChargingStation {
  id: string;
  metadata: string;
  location: Location;
}

export interface ScootersResponse {
  scooters: Scooter[];
}

export interface ChargingStationsResponse {
  chargingStations: ChargingStation[];
}

export interface ScooterUpdate {
  scooterUpdated: Scooter;
}

export interface ChargingStationUpdate {
  chargingStationUpdated: ChargingStation;
} 