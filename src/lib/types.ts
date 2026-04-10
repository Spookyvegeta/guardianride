export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserPersona = 'gig_worker' | 'student' | 'solo_traveler' | 'senior' | 'field_agent';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  language: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  persona: UserPersona;
  bloodGroup: BloodGroup;
  medicalConditions: string;
  allergies: string;
  medications: string;
  platforms: string[]; // For gig workers/agents
  contacts: EmergencyContact[];
  homeArea: string;
}

export interface Incident {
  id: string;
  userId: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  type: 'accident' | 'panic' | 'fall' | 'drowsiness';
  status: 'detected' | 'confirmed' | 'resolved' | 'false_alarm';
  outcome?: 'fine' | 'hospitalised' | 'deceased';
}

export interface HazardReport {
  id: string;
  type: 'pothole' | 'lighting' | 'construction' | 'unfenced_hazard';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  timestamp: Date;
  description: string;
}
