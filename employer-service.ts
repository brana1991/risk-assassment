import { getRepository } from 'typeorm';
import { Employer } from '../entity/employer';

export class EmployeeService {
  private employeeRepository = getRepository(Employer);

  // Custom service methods can be defined here
}