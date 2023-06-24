import { AppDataSource } from "../app-data-source";
import { Employer } from "../entity/employer";

export async function createEmployee() {
  try {
    const employerRepository = AppDataSource.getRepository(Employer);
    const newEmployer = new Employer();
    newEmployer.name = "John Doe";
    newEmployer.address = "Ivo Lole Ribara";
    newEmployer.identityNumber = 5000;
    newEmployer.pib = 1234;
    newEmployer.responsiblePerson = "Branislav";

    const savedEmployer = await employerRepository.save(newEmployer);

    console.log("Employee created:", savedEmployer);
  } catch (error) {
    console.error("Error creating employee:", error);
  }
}
