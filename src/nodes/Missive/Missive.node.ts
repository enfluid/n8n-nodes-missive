import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
  NodeOperationError,
  JsonObject,
} from 'n8n-workflow';

export class Missive implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Missive',
    name: 'missive',
    icon: 'file:missive.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Work with the Missive API',
    defaults: {
      name: 'Missive',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'missiveApi',
        required: true,
      },
    ],
    properties: [
      // Resources
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Draft',
            value: 'draft',
          },
          {
            name: 'Post',
            value: 'post',
          },
          {
            name: 'Contact',
            value: 'contact',
          },
          {
            name: 'Contact Book',
            value: 'contactBook',
          },
          {
            name: 'Conversation',
            value: 'conversation',
          },
          {
            name: 'Organization',
            value: 'organization',
          },
        ],
        default: 'draft',
      },

      // DRAFT OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['draft'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new draft',
            action: 'Create a draft',
          },
        ],
        default: 'create',
      },

      // Draft Create Fields
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        description: 'Subject of the draft',
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        description: 'HTML body of the draft',
      },
      {
        displayName: 'From Name',
        name: 'fromName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        description: 'Name of the sender',
      },
      {
        displayName: 'From Email',
        name: 'fromEmail',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        description: 'Email address of the sender',
      },
      {
        displayName: 'To',
        name: 'to',
        placeholder: 'Add To Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'CC',
        name: 'cc',
        placeholder: 'Add CC Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the CC recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the CC recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'BCC',
        name: 'bcc',
        placeholder: 'Add BCC Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the BCC recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the BCC recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'References',
            name: 'references',
            type: 'string',
            default: '',
            description: 'References for threading. Format: reference1,reference2',
            placeholder: 'ref1,ref2',
          },
          {
            displayName: 'Conversation ID',
            name: 'conversation',
            type: 'string',
            default: '',
            description: 'ID of the conversation to create the draft in',
          },
          {
            displayName: 'Team ID',
            name: 'team',
            type: 'string',
            default: '',
            description: 'ID of the team to link the draft\'s conversation to',
          },
          {
            displayName: 'Force Team',
            name: 'forceTeam',
            type: 'boolean',
            default: false,
            description: 'Force a new team even if the conversation is already in another team',
          },
          {
            displayName: 'Organization ID',
            name: 'organization',
            type: 'string',
            default: '',
            description: 'ID of the organization to scope the conversation to',
          },
          {
            displayName: 'Add Users',
            name: 'addUsers',
            type: 'string',
            default: '',
            description: 'User IDs to get access to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Assignees',
            name: 'addAssignees',
            type: 'string',
            default: '',
            description: 'User IDs to assign to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Schedule For',
            name: 'scheduleFor',
            type: 'dateTime',
            default: '',
            description: 'When to send the draft',
          },
        ],
      },

      // POST OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['post'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new post',
            action: 'Create a post',
          },
        ],
        default: 'create',
      },

      // Post Create Fields
      {
        displayName: 'HTML Content',
        name: 'html',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create'],
          },
        },
        description: 'HTML content of the post',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'References',
            name: 'references',
            type: 'string',
            default: '',
            description: 'References for threading. Format: reference1,reference2',
            placeholder: 'ref1,ref2',
          },
          {
            displayName: 'Conversation ID',
            name: 'conversation',
            type: 'string',
            default: '',
            description: 'ID of the conversation to create the post in',
          },
          {
            displayName: 'Team ID',
            name: 'team',
            type: 'string',
            default: '',
            description: 'ID of the team to link the post\'s conversation to',
          },
          {
            displayName: 'Force Team',
            name: 'forceTeam',
            type: 'boolean',
            default: false,
            description: 'Force a new team even if the conversation is already in another team',
          },
          {
            displayName: 'Organization ID',
            name: 'organization',
            type: 'string',
            default: '',
            description: 'ID of the organization to scope the conversation to',
          },
          {
            displayName: 'Add Users',
            name: 'addUsers',
            type: 'string',
            default: '',
            description: 'User IDs to get access to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Assignees',
            name: 'addAssignees',
            type: 'string',
            default: '',
            description: 'User IDs to assign to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
        ],
      },

      // CONTACT OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['contact'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new contact',
            action: 'Create a contact',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Retrieve a contact',
            action: 'Get a contact',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Retrieve all contacts',
            action: 'Get all contacts',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a contact',
            action: 'Update a contact',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a contact',
            action: 'Delete a contact',
          },
        ],
        default: 'create',
      },

      // Contact Get Operation
      {
        displayName: 'Contact ID',
        name: 'contactId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['get', 'update', 'delete'],
          },
        },
        description: 'ID of the contact',
      },

      // Contact Create/Update Fields
      {
        displayName: 'Contact Book ID',
        name: 'contactBookId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['create', 'update'],
          },
        },
        description: 'ID of the contact book to store the contact in',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['create', 'update'],
          },
        },
        description: 'Name of the contact',
      },
      {
        displayName: 'Emails',
        name: 'emails',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['create', 'update'],
          },
        },
        description: 'Email addresses of the contact. Format: email1,email2',
        placeholder: 'email1@example.com,email2@example.com',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['create', 'update'],
          },
        },
        options: [
          {
            displayName: 'Phones',
            name: 'phones',
            type: 'string',
            default: '',
            description: 'Phone numbers of the contact. Format: phone1,phone2',
            placeholder: '+11234567890,+10987654321',
          },
          {
            displayName: 'Websites',
            name: 'websites',
            type: 'string',
            default: '',
            description: 'Websites of the contact. Format: website1,website2',
            placeholder: 'https://example.com,https://example.org',
          },
          {
            displayName: 'Company',
            name: 'company',
            type: 'string',
            default: '',
            description: 'Company name of the contact',
          },
          {
            displayName: 'Birthday',
            name: 'birthday',
            type: 'string',
            default: '',
            description: 'Birthday of the contact in YYYY-MM-DD format',
            placeholder: '1990-01-01',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,
            },
            description: 'Description of the contact',
          },
        ],
      },

      // Contact Get All Operation
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['contact'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Contact Book ID',
            name: 'contactBookId',
            type: 'string',
            default: '',
            description: 'ID of the contact book to list contacts from',
          },
          {
            displayName: 'Search Query',
            name: 'q',
            type: 'string',
            default: '',
            description: 'Search query to filter contacts',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 100,
            description: 'Maximum number of contacts to return',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Offset for pagination',
          },
        ],
      },

      // CONTACT BOOK OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['contactBook'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Retrieve all contact books',
            action: 'Get all contact books',
          },
        ],
        default: 'getAll',
      },

      // CONVERSATION OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['conversation'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Retrieve a conversation',
            action: 'Get a conversation',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Retrieve all conversations',
            action: 'Get all conversations',
          },
        ],
        default: 'getAll',
      },

      // Conversation Get Operation
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['get'],
          },
        },
        description: 'ID of the conversation',
      },

      // Conversation Get All Operation
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['conversation'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 100,
            description: 'Maximum number of conversations to return',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Offset for pagination',
          },
        ],
      },

      // ORGANIZATION OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['organization'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Retrieve all organizations',
            action: 'Get all organizations',
          },
        ],
        default: 'getAll',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // For all operations
    const credentials = await this.getCredentials('missiveApi') as { apiToken: string };
    const baseUrl = 'https://public.missiveapp.com/v1';
    
    for (let i = 0; i < items.length; i++) {
      try {
        // DRAFT RESOURCE
        if (resource === 'draft') {
          // Create a draft
          if (operation === 'create') {
            const subject = this.getNodeParameter('subject', i) as string;
            const body = this.getNodeParameter('body', i) as string;
            const fromName = this.getNodeParameter('fromName', i, '') as string;
            const fromEmail = this.getNodeParameter('fromEmail', i, '') as string;
            
            const toData = this.getNodeParameter('to.emails', i, []) as Array<{ name: string, address: string }>;
            const ccData = this.getNodeParameter('cc.emails', i, []) as Array<{ name: string, address: string }>;
            const bccData = this.getNodeParameter('bcc.emails', i, []) as Array<{ name: string, address: string }>;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              references?: string;
              conversation?: string;
              team?: string;
              forceTeam?: boolean;
              organization?: string;
              addUsers?: string;
              addAssignees?: string;
              scheduleFor?: string;
            };
            
            const draftData: any = {
              subject,
              body,
            };
            
            // Set from information if provided
            if (fromName || fromEmail) {
              draftData.from = {};
              if (fromName) draftData.from.name = fromName;
              if (fromEmail) draftData.from.address = fromEmail;
            }
            
            // Add to, cc, bcc recipients if any
            if (toData && toData.length > 0) {
              draftData.to = toData;
            }
            
            if (ccData && ccData.length > 0) {
              draftData.cc = ccData;
            }
            
            if (bccData && bccData.length > 0) {
              draftData.bcc = bccData;
            }
            
            // Add additional fields if any
            if (additionalFields.references) {
              draftData.references = additionalFields.references.split(',').map(ref => ref.trim());
            }
            
            if (additionalFields.conversation) {
              draftData.conversation = additionalFields.conversation;
            }
            
            if (additionalFields.team) {
              draftData.team = additionalFields.team;
            }
            
            if (additionalFields.forceTeam !== undefined) {
              draftData.force_team = additionalFields.forceTeam;
            }
            
            if (additionalFields.organization) {
              draftData.organization = additionalFields.organization;
            }
            
            if (additionalFields.addUsers) {
              draftData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());
            }
            
            if (additionalFields.addAssignees) {
              draftData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());
            }
            
            if (additionalFields.scheduleFor) {
              draftData.schedule_for = additionalFields.scheduleFor;
            }
            
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/drafts`,
              body: { drafts: draftData },
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
        }
        
        // POST RESOURCE
        else if (resource === 'post') {
          // Create a post
          if (operation === 'create') {
            const html = this.getNodeParameter('html', i) as string;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              references?: string;
              conversation?: string;
              team?: string;
              forceTeam?: boolean;
              organization?: string;
              addUsers?: string;
              addAssignees?: string;
              addSharedLabels?: string;
            };
            
            const postData: any = {
              html,
            };
            
            // Add additional fields if any
            if (additionalFields.references) {
              postData.references = additionalFields.references.split(',').map(ref => ref.trim());
            }
            
            if (additionalFields.conversation) {
              postData.conversation = additionalFields.conversation;
            }
            
            if (additionalFields.team) {
              postData.team = additionalFields.team;
            }
            
            if (additionalFields.forceTeam !== undefined) {
              postData.force_team = additionalFields.forceTeam;
            }
            
            if (additionalFields.organization) {
              postData.organization = additionalFields.organization;
            }
            
            if (additionalFields.addUsers) {
              postData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());
            }
            
            if (additionalFields.addAssignees) {
              postData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());
            }
            
            if (additionalFields.addSharedLabels) {
              postData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());
            }
            
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/posts`,
              body: { posts: postData },
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
        }
        
        // CONTACT RESOURCE
        else if (resource === 'contact') {
          // Get a contact
          if (operation === 'get') {
            const contactId = this.getNodeParameter('contactId', i) as string;
            
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contacts/${contactId}`,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
          
          // Get all contacts
          else if (operation === 'getAll') {
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              contactBookId?: string;
              q?: string;
              limit?: number;
              offset?: number;
            };
            
            const qs: any = {};
            
            if (additionalFields.contactBookId) {
              qs.contact_book_id = additionalFields.contactBookId;
            }
            
            if (additionalFields.q) {
              qs.q = additionalFields.q;
            }
            
            if (additionalFields.limit) {
              qs.limit = additionalFields.limit;
            }
            
            if (additionalFields.offset) {
              qs.offset = additionalFields.offset;
            }
            
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contacts`,
              qs,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
          
          // Create a contact
          else if (operation === 'create') {
            const contactBookId = this.getNodeParameter('contactBookId', i) as string;
            const name = this.getNodeParameter('name', i, '') as string;
            const emailsString = this.getNodeParameter('emails', i, '') as string;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              phones?: string;
              websites?: string;
              company?: string;
              birthday?: string;
              description?: string;
            };
            
            const contactData: any = {
              contact_book_id: contactBookId,
            };
            
            if (name) {
              contactData.name = name;
            }
            
            if (emailsString) {
              contactData.emails = emailsString.split(',').map(email => email.trim());
            }
            
            if (additionalFields.phones) {
              contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());
            }
            
            if (additionalFields.websites) {
              contactData.websites = additionalFields.websites.split(',').map(website => website.trim());
            }
            
            if (additionalFields.company) {
              contactData.company = additionalFields.company;
            }
            
            if (additionalFields.birthday) {
              contactData.birthday = additionalFields.birthday;
            }
            
            if (additionalFields.description) {
              contactData.description = additionalFields.description;
            }
            
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contacts`,
              body: { contacts: contactData },
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
          
          // Update a contact
          else if (operation === 'update') {
            const contactId = this.getNodeParameter('contactId', i) as string;
            const contactBookId = this.getNodeParameter('contactBookId', i) as string;
            const name = this.getNodeParameter('name', i, '') as string;
            const emailsString = this.getNodeParameter('emails', i, '') as string;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              phones?: string;
              websites?: string;
              company?: string;
              birthday?: string;
              description?: string;
            };
            
            const contactData: any = {
              contact_book_id: contactBookId,
            };
            
            if (name) {
              contactData.name = name;
            }
            
            if (emailsString) {
              contactData.emails = emailsString.split(',').map(email => email.trim());
            }
            
            if (additionalFields.phones) {
              contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());
            }
            
            if (additionalFields.websites) {
              contactData.websites = additionalFields.websites.split(',').map(website => website.trim());
            }
            
            if (additionalFields.company) {
              contactData.company = additionalFields.company;
            }
            
            if (additionalFields.birthday) {
              contactData.birthday = additionalFields.birthday;
            }
            
            if (additionalFields.description) {
              contactData.description = additionalFields.description;
            }
            
            const options = {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contacts/${contactId}`,
              body: { contacts: contactData },
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
          
          // Delete a contact
          else if (operation === 'delete') {
            const contactId = this.getNodeParameter('contactId', i) as string;
            
            const options = {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contacts/${contactId}`,
              json: true,
            };
            
            await this.helpers.request(options);
            returnData.push({ json: { success: true } });
          }
        }
        
        // CONTACT BOOK RESOURCE
        else if (resource === 'contactBook') {
          // Get all contact books
          if (operation === 'getAll') {
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/contact_books`,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
        }
        
        // CONVERSATION RESOURCE
        else if (resource === 'conversation') {
          // Get a conversation
          if (operation === 'get') {
            const conversationId = this.getNodeParameter('conversationId', i) as string;
            
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/conversations/${conversationId}`,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
          
          // Get all conversations
          else if (operation === 'getAll') {
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              limit?: number;
              offset?: number;
            };
            
            const qs: any = {};
            
            if (additionalFields.limit) {
              qs.limit = additionalFields.limit;
            }
            
            if (additionalFields.offset) {
              qs.offset = additionalFields.offset;
            }
            
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/conversations`,
              qs,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
        }
        
        // ORGANIZATION RESOURCE
        else if (resource === 'organization') {
          // Get all organizations
          if (operation === 'getAll') {
            const options = {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${credentials.apiToken}`,
              },
              uri: `${baseUrl}/organizations`,
              json: true,
            };
            
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
          }
        }
      }
      catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }
    
    return [returnData];
  }
}