import type { AppDefinition } from '../../../src/input/types'
import JOB_ROLES from './job-roles'
import SKILLS from './skills'

const projectPlannerApp: AppDefinition = {
  name: 'Project Planner',
  description: 'Manage Projects, Team Members, Open Positions, and Candidates.',
  region: 'us-west-2',
  defaultAuthRouteEntity: 'Project',
  permissionModel: 'User',
  theme: {
    primaryColor: '#579ddd',
  },
  entities: {
    User: {
      properties: {
        jobRole: {
          type: 'enum',
          enumOptions: JOB_ROLES,
          isRequired: true,
        },
        bio: {
          type: 'string',
          format: 'multiline',
        },
      },
    },
    Project: {
      ui: {
        listView: 'CardList',
        icon: 'AppstoreFilled',
      },
      properties: {
        projectId: {
          type: 'string',
          isIdProperty: true,
        },
        name: {
          type: 'string',
          isNameProperty: true,
        },
        logo: {
          type: 'image',
          isImageProperty: true,
        },
        projectManagerUserId: {
          type: 'string',
          relatedEntity: 'User',
        },
        techLeadUserId: {
          type: 'string',
          relatedEntity: 'User',
        },
        description: {
          type: 'string',
          format: 'multiline',
        },
        startDate: {
          type: 'date',
        },
        endDate: {
          type: 'date',
        },
        status: {
          type: 'enum',
          enumOptions: ['Pending', 'Active', 'Complete', 'Cancelled'],
          isRequired: true,
        },
      },
    },
    TeamMember: {
      ui: {
        remainOnCurrentPageOnCreate: true,
        generateDetailsPage: false,
        listView: 'CardList',
      },
      belongsTo: 'Project',
      properties: {
        projectId: {
          type: 'string',
          relatedEntity: 'Project',
        },
        teamMemberUserId: {
          type: 'string',
          isIdProperty: true,
          isNameProperty: true,
          relatedEntity: 'User',
        },
      },
    },
    OpenPosition: {
      ui: {
        remainOnCurrentPageOnCreate: true,
        generateDetailsPage: false,
        nestedTableEntity: 'Candidate',
      },
      belongsTo: 'Project',
      properties: {
        projectId: {
          type: 'string',
          relatedEntity: 'Project',
          isIdProperty: true,
        },
        openPositionId: {
          type: 'string',
        },
        requiredSkills: {
          type: 'array',
          arrayOptions: SKILLS,
        },
        role: {
          type: 'enum',
          enumOptions: JOB_ROLES,
          isRequired: true,
        },
      },
    },
    Candidate: {
      belongsTo: 'OpenPosition',
      ui: {
        remainOnCurrentPageOnCreate: true,
        generateDetailsPage: false,
        listView: 'CardList',
      },
      properties: {
        openPositionId: {
          type: 'string',
          relatedEntity: 'OpenPosition',
        },
        candidateUserId: {
          type: 'string',
          relatedEntity: 'User',
          isIdProperty: true,
          isNameProperty: true,
        },
        status: {
          type: 'enum',
          enumOptions: ['Pending', 'Interviewing', 'Rejected', 'Accepted'],
          isRequired: true,
        },
      },
    },
  },
}

export default projectPlannerApp
