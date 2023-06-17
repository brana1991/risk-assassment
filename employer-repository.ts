import { EntityRepository, Repository } from 'typeorm';
import { Employer } from '../entity/employer';

@EntityRepository(Employer)
export class EmployeeRepository extends Repository<Employer> {
  // Custom repository methods can be defined here
}