export interface ITown {
  id: string;
  name: string;
  insee_code?: string;
  postal_code?: string;
  dep_code?: string;
  position?: [number, number];
  description?: string;
}

export interface ICharacter {
  id: string;
  lastname: string;
  firstname?: string;
  bio?: string;
  birthplace?: string;
  deathplace?: string;
  dep_code?: string;
  town_id?: string;
}
