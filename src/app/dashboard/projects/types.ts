export enum ProjectType {
  CATASTROPHE_RISK = 'CATASTROPHE_RISK',
  DEVELOPMENT_RISK = 'DEVELOPMENT_RISK',
}

export const ProjectTypeMap = new Map<ProjectType, { type: ProjectType; label: string }>([
  [
    ProjectType.CATASTROPHE_RISK,
    { type: ProjectType.CATASTROPHE_RISK, label: 'Процена ризика од катастрофа' },
  ],
  [ProjectType.DEVELOPMENT_RISK, { type: ProjectType.DEVELOPMENT_RISK, label: 'РИЗИК РАЗВОЈА' }],
]);
