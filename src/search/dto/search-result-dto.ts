import { CargoDocument } from 'src/cargos/schemas/cargos.schema';
import { TripDocument } from 'src/trips/schemas/trips.schema';

export class searchResultDto {
  results: CargoDocument[] | TripDocument[];
  type: string;
}
