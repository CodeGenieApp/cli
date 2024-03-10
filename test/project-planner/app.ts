import type { App } from '../../src/input/types.js'
import JOB_ROLES from './job-roles.js'
import SKILLS from './skills.js'

const projectPlannerApp: App = {
  name: 'Project Planner',
  description: '',
  defaultAuthRouteEntity: 'App',
  permissionModel: 'User',
  theme: {
    primaryColor: '#579ddd',
  },
  entities: {
    User: {
      properties: {
        userId: {
          type: 'string',
          isIdProperty: true,
        },
        name: {
          type: 'string',
          isNameProperty: true,
        },
        email: {
          type: 'string',
          format: 'email',
          isImmutable: true,
          isRequired: true,
        },
        profilePicture: {
          type: 'image',
          isImageProperty: true,
        },
        jobRole: {
          type: 'enum',
          enumOptions: JOB_ROLES,
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
        nestedTable: 'Candidate',
      },
      belongsTo: 'Project',
      properties: {
        projectId: {
          type: 'string',
          relatedEntity: 'Project',
        },
        requiredSkills: {
          type: 'array',
          enumOptions: SKILLS,
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
