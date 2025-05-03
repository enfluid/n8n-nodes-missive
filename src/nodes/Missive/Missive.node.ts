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
            name: 'Create Email',
            value: 'createEmail',
            description: 'Create a new email draft',
            action: 'Create an email draft',
          },
          {
            name: 'Create SMS & WhatsApp',
            value: 'createMessaging',
            description: 'Create a new SMS or WhatsApp message draft',
            action: 'Create an SMS or WhatsApp draft',
          },
        ],
        default: 'createEmail',
      },

      // Draft Create Email Fields
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Subject of the email',
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
            operation: ['createEmail'],
          },
        },
        description: 'HTML body of the email',
      },
      {
        displayName: 'Send',
        name: 'send',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Whether to send the email immediately',
      },
      {
        displayName: 'Close',
        name: 'close',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Whether to close the conversation after sending',
      },
      {
        displayName: 'From Name',
        name: 'fromName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
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
            operation: ['createEmail'],
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
            operation: ['createEmail'],
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
            operation: ['createEmail'],
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
            operation: ['createEmail'],
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
            operation: ['createEmail'],
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
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
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
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Schedule For',
            name: 'scheduleFor',
            type: 'dateTime',
            default: '',
            description: 'When to send the draft',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Auto Follow-up',
            name: 'autoFollowup',
            type: 'boolean',
            default: false,
            description: 'Enable auto follow-up for this message',
          },
          {
            displayName: 'Attachments',
            name: 'attachments',
            placeholder: 'Add Attachment',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'attachment',
                displayName: 'Attachment',
                values: [
                  {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the binary property containing the attachment data',
                  },
                  {
                    displayName: 'File Name',
                    name: 'fileName',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment file',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Draft Create SMS & WhatsApp Fields
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
            operation: ['createMessaging'],
          },
        },
        description: 'Content of the message',
      },
      {
        displayName: 'Send',
        name: 'send',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Whether to send the message immediately',
      },
      {
        displayName: 'Close',
        name: 'close',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Whether to close the conversation after sending',
      },
      {
        displayName: 'From Phone Number',
        name: 'fromPhoneNumber',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Phone number to send from (e.g., +18005550199)',
        placeholder: '+18005550199',
      },
      {
        displayName: 'Message Type',
        name: 'messageType',
        type: 'options',
        options: [
          {
            name: 'SMS',
            value: '',
          },
          {
            name: 'WhatsApp',
            value: 'whatsapp',
          },
        ],
        default: '',
        required: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Type of message to send',
      },
      {
        displayName: 'To Phone Numbers',
        name: 'toPhoneNumbers',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Phone numbers to send to. Use comma to separate multiple numbers.',
        placeholder: '+18005550199,+18005550200',
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
            operation: ['createMessaging'],
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
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
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
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Schedule For',
            name: 'scheduleFor',
            type: 'dateTime',
            default: '',
            description: 'When to send the draft',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Auto Follow-up',
            name: 'autoFollowup',
            type: 'boolean',
            default: false,
            description: 'Enable auto follow-up for this message',
          },
          {
            displayName: 'External Response ID',
            name: 'externalResponseId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/messageType': ['whatsapp'],
              },
            },
            description: 'ID for WhatsApp template responses (only for WhatsApp)',
          },
          {
            displayName: 'External Response Variables',
            name: 'externalResponseVariables',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/messageType': ['whatsapp'],
              },
            },
            description: 'Variables for WhatsApp templates in JSON format (only for WhatsApp)',
            placeholder: '{"1":"Variable1","2":"Variable2"}',
          },
          {
            displayName: 'Attachments',
            name: 'attachments',
            placeholder: 'Add Attachment',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'attachment',
                displayName: 'Attachment',
                values: [
                  {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the binary property containing the attachment data',
                  },
                  {
                    displayName: 'File Name',
                    name: 'fileName',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment file',
                  },
                ],
              },
            ],
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
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
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
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Close Conversation',
            name: 'close',
            type: 'boolean',
            default: false,
            description: 'Whether to close the conversation after creating the post',
          },
          {
            displayName: 'Re-open Conversation',
            name: 'reopen',
            type: 'boolean',
            default: false,
            description: 'Whether to re-open the conversation if it was closed',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Mark as Unread',
            name: 'markAsUnread',
            type: 'boolean',
            default: false,
            description: 'Mark the conversation as unread for all its members',
          },
          {
            displayName: 'Suppress Notifications',
            name: 'suppressNotifications',
            type: 'boolean',
            default: false,
            description: 'Whether to suppress notifications for this post',
          },
          {
            displayName: 'Send as System Message',
            name: 'system',
            type: 'boolean',
            default: false,
            description: 'Whether to send this post as a system message (appears differently in the UI)',
          },
          {
            displayName: 'Custom Username',
            name: 'username',
            type: 'string',
            default: '',
            description: 'Name of the post author, used instead of the API token owner\'s name',
          },
          {
            displayName: 'Custom Username Icon',
            name: 'username_icon',
            type: 'string',
            default: '',
            description: 'URL to an image for the post author avatar',
            placeholder: 'https://example.com/avatar.png',
          },
          {
            displayName: 'Custom Conversation Icon',
            name: 'conversation_icon',
            type: 'string',
            default: '',
            description: 'URL to an image used as the icon in the conversation list',
            placeholder: 'https://example.com/icon.png',
          },
          {
            displayName: 'Text (Plain)',
            name: 'text',
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,
            },
            description: 'Plain text content of the post',
          },
          {
            displayName: 'Markdown',
            name: 'markdown',
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,
            },
            description: 'Markdown-formatted content of the post',
          },
          {
            displayName: 'Notification',
            name: 'notification',
            placeholder: 'Add Notification',
            type: 'fixedCollection',
            default: {},
            options: [
              {
                name: 'value',
                displayName: 'Notification',
                values: [
                  {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    default: '',
                    description: 'Title of the notification',
                  },
                  {
                    displayName: 'Body',
                    name: 'body',
                    type: 'string',
                    default: '',
                    description: 'Body text of the notification',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'Attachments',
            name: 'attachments',
            placeholder: 'Add Attachment',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'attachment',
                displayName: 'Attachment',
                values: [
                  {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the binary property containing the attachment data',
                  },
                  {
                    displayName: 'File Name',
                    name: 'fileName',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment file',
                  },
                  {
                    displayName: 'Attachment Fields',
                    name: 'fields',
                    placeholder: 'Add Field',
                    type: 'fixedCollection',
                    typeOptions: {
                      multipleValues: true,
                    },
                    default: {},
                    options: [
                      {
                        name: 'field',
                        displayName: 'Field',
                        values: [
                          {
                            displayName: 'Title',
                            name: 'title',
                            type: 'string',
                            default: '',
                            description: 'Title of the field',
                          },
                          {
                            displayName: 'Value',
                            name: 'value',
                            type: 'string',
                            default: '',
                            description: 'Value of the field',
                          },
                          {
                            displayName: 'Short',
                            name: 'short',
                            type: 'boolean',
                            default: false,
                            description: 'If true, field will be displayed in a compact format',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    displayName: 'Color',
                    name: 'color',
                    type: 'color',
                    default: '',
                    description: 'Color for the attachment (hex code or named color)',
                  },
                  {
                    displayName: 'Pretext',
                    name: 'pretext',
                    type: 'string',
                    default: '',
                    description: 'Text that appears above the attachment',
                  },
                  {
                    displayName: 'Author Name',
                    name: 'author_name',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment author',
                  },
                  {
                    displayName: 'Author Link',
                    name: 'author_link',
                    type: 'string',
                    default: '',
                    description: 'URL linking to the author',
                    placeholder: 'https://example.com/author',
                  },
                  {
                    displayName: 'Author Icon',
                    name: 'author_icon',
                    type: 'string',
                    default: '',
                    description: 'URL to an image for the author icon',
                    placeholder: 'https://example.com/author-icon.png',
                  },
                  {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    default: '',
                    description: 'Title of the attachment',
                  },
                  {
                    displayName: 'Title Link',
                    name: 'title_link',
                    type: 'string',
                    default: '',
                    description: 'URL linking to the attachment resource',
                    placeholder: 'https://example.com/resource',
                  },
                  {
                    displayName: 'Image URL',
                    name: 'image_url',
                    type: 'string',
                    default: '',
                    description: 'URL to an image for the attachment',
                    placeholder: 'https://example.com/image.png',
                  },
                  {
                    displayName: 'Text',
                    name: 'text',
                    type: 'string',
                    default: '',
                    description: 'Text content for the attachment',
                  },
                  {
                    displayName: 'Markdown',
                    name: 'markdown',
                    type: 'string',
                    default: '',
                    description: 'Markdown-formatted text for the attachment',
                  },
                  {
                    displayName: 'Timestamp',
                    name: 'timestamp',
                    type: 'number',
                    default: '',
                    description: 'Unix timestamp for the attachment',
                  },
                  {
                    displayName: 'Footer',
                    name: 'footer',
                    type: 'string',
                    default: '',
                    description: 'Footer text for the attachment',
                  },
                  {
                    displayName: 'Footer Icon',
                    name: 'footer_icon',
                    type: 'string',
                    default: '',
                    description: 'URL to an image for the footer icon',
                    placeholder: 'https://example.com/footer-icon.png',
                  },
                ],
              },
            ],
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
          // Create Email
          if (operation === 'createEmail') {
            const subject = this.getNodeParameter('subject', i) as string;
            const body = this.getNodeParameter('body', i) as string;
            const send = this.getNodeParameter('send', i, false) as boolean;
            const close = this.getNodeParameter('close', i, false) as boolean;
            const fromName = this.getNodeParameter('fromName', i, '') as string;
            const fromEmail = this.getNodeParameter('fromEmail', i, '') as string;
            
            const toData = this.getNodeParameter('to.emails', i, []) as Array<{ name: string, address: string }>;
            const ccData = this.getNodeParameter('cc.emails', i, []) as Array<{ name: string, address: string }>;
            const bccData = this.getNodeParameter('bcc.emails', i, []) as Array<{ name: string, address: string }>;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              references?: string;
              conversation?: string;
              conversationSubject?: string;
              conversationColor?: string;
              team?: string;
              forceTeam?: boolean;
              organization?: string;
              addUsers?: string;
              addAssignees?: string;
              addSharedLabels?: string;
              removeSharedLabels?: string;
              scheduleFor?: string;
              addToInbox?: boolean;
              addToTeamInbox?: boolean;
              autoFollowup?: boolean;
              attachments?: { attachment: Array<{ binaryPropertyName: string, fileName: string }> };
            };
            
            const draftData: any = {
              subject,
              body,
              send,
              close,
            };
            
            // Set from information if provided
            if (fromName || fromEmail) {
              draftData.from_field = {};
              if (fromName) draftData.from_field.name = fromName;
              if (fromEmail) draftData.from_field.address = fromEmail;
            }
            
            // Add to, cc, bcc recipients if any
            if (toData && toData.length > 0) {
              draftData.to_fields = toData;
            }
            
            if (ccData && ccData.length > 0) {
              draftData.cc_field = ccData;
            }
            
            if (bccData && bccData.length > 0) {
              draftData.bcc_field = bccData;
            }
            
            // Add additional fields if any
            if (additionalFields.references) {
              draftData.references = additionalFields.references.split(',').map(ref => ref.trim());
            }
            
            if (additionalFields.conversation) {
              draftData.conversation = additionalFields.conversation;
            }
            
            if (additionalFields.conversationSubject) {
              draftData.conversation_subject = additionalFields.conversationSubject;
            }
            
            if (additionalFields.conversationColor) {
              draftData.conversation_color = additionalFields.conversationColor;
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
            
            if (additionalFields.addSharedLabels) {
              draftData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());
            }
            
            if (additionalFields.removeSharedLabels) {
              draftData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());
            }
            
            if (additionalFields.scheduleFor) {
              draftData.schedule_for = additionalFields.scheduleFor;
            }
            
            if (additionalFields.addToInbox !== undefined) {
              draftData.add_to_inbox = additionalFields.addToInbox;
            }
            
            if (additionalFields.addToTeamInbox !== undefined) {
              draftData.add_to_team_inbox = additionalFields.addToTeamInbox;
            }
            
            if (additionalFields.autoFollowup !== undefined) {
              draftData.auto_followup = additionalFields.autoFollowup;
            }
            
            // Handle attachments if any
            if (additionalFields.attachments && additionalFields.attachments.attachment) {
              const attachmentsData = [];
              
              for (const attachment of additionalFields.attachments.attachment) {
                const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);
                const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);
                
                const fileName = attachment.fileName || binaryData.fileName || 'unknown';
                const mimeType = binaryData.mimeType || 'application/octet-stream';
                
                attachmentsData.push({
                  filename: fileName,
                  content_type: mimeType,
                  content: binaryDataBuffer.toString('base64'),
                });
              }
              
              if (attachmentsData.length > 0) {
                draftData.attachments = attachmentsData;
              }
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
          
          // Create SMS & WhatsApp
          else if (operation === 'createMessaging') {
            const body = this.getNodeParameter('body', i) as string;
            const send = this.getNodeParameter('send', i, false) as boolean;
            const close = this.getNodeParameter('close', i, false) as boolean;
            const fromPhoneNumber = this.getNodeParameter('fromPhoneNumber', i) as string;
            const messageType = this.getNodeParameter('messageType', i) as string;
            const toPhoneNumbersString = this.getNodeParameter('toPhoneNumbers', i) as string;
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              references?: string;
              conversation?: string;
              conversationSubject?: string;
              conversationColor?: string;
              team?: string;
              forceTeam?: boolean;
              organization?: string;
              addUsers?: string;
              addAssignees?: string;
              addSharedLabels?: string;
              removeSharedLabels?: string;
              scheduleFor?: string;
              addToInbox?: boolean;
              addToTeamInbox?: boolean;
              autoFollowup?: boolean;
              externalResponseId?: string;
              externalResponseVariables?: string;
              attachments?: { attachment: Array<{ binaryPropertyName: string, fileName: string }> };
            };
            
            const draftData: any = {
              body,
              send,
              close,
            };
            
            // Set from field for SMS/WhatsApp
            draftData.from_field = {
              phone_number: fromPhoneNumber,
              type: messageType,
            };
            
            // Set to field for SMS/WhatsApp
            const toPhoneNumbers = toPhoneNumbersString.split(',').map(number => number.trim());
            draftData.to_fields = toPhoneNumbers.map(phoneNumber => ({ phone_number: phoneNumber }));
            
            // Add additional fields if any
            if (additionalFields.references) {
              draftData.references = additionalFields.references.split(',').map(ref => ref.trim());
            }
            
            if (additionalFields.conversation) {
              draftData.conversation = additionalFields.conversation;
            }
            
            if (additionalFields.conversationSubject) {
              draftData.conversation_subject = additionalFields.conversationSubject;
            }
            
            if (additionalFields.conversationColor) {
              draftData.conversation_color = additionalFields.conversationColor;
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
            
            if (additionalFields.addSharedLabels) {
              draftData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());
            }
            
            if (additionalFields.removeSharedLabels) {
              draftData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());
            }
            
            if (additionalFields.scheduleFor) {
              draftData.schedule_for = additionalFields.scheduleFor;
            }
            
            if (additionalFields.addToInbox !== undefined) {
              draftData.add_to_inbox = additionalFields.addToInbox;
            }
            
            if (additionalFields.addToTeamInbox !== undefined) {
              draftData.add_to_team_inbox = additionalFields.addToTeamInbox;
            }
            
            if (additionalFields.autoFollowup !== undefined) {
              draftData.auto_followup = additionalFields.autoFollowup;
            }
            
            // Add WhatsApp specific fields
            if (messageType === 'whatsapp') {
              if (additionalFields.externalResponseId) {
                draftData.external_response_id = additionalFields.externalResponseId;
              }
              
              if (additionalFields.externalResponseVariables) {
                try {
                  // Parse JSON string to object
                  draftData.external_response_variables = JSON.parse(additionalFields.externalResponseVariables);
                } catch (error) {
                  throw new NodeOperationError(this.getNode(), 'Invalid JSON in External Response Variables', {
                    itemIndex: i,
                  });
                }
              }
            }
            
            // Handle attachments if any
            if (additionalFields.attachments && additionalFields.attachments.attachment) {
              const attachmentsData = [];
              
              for (const attachment of additionalFields.attachments.attachment) {
                const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);
                const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);
                
                const fileName = attachment.fileName || binaryData.fileName || 'unknown';
                const mimeType = binaryData.mimeType || 'application/octet-stream';
                
                attachmentsData.push({
                  filename: fileName,
                  content_type: mimeType,
                  content: binaryDataBuffer.toString('base64'),
                });
              }
              
              if (attachmentsData.length > 0) {
                draftData.attachments = attachmentsData;
              }
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
            const html = this.getNodeParameter('html', i, '') as string;
            const text = this.getNodeParameter('text', i, '') as string;
            const markdown = this.getNodeParameter('markdown', i, '') as string;
            
            // Check if at least one of the required content fields is provided
            if (!html && !text && !markdown && 
                (!this.getNodeParameter('attachments', i, { attachment: [] }) || 
                 this.getNodeParameter('attachments.attachment', i, []).length === 0)) {
              throw new NodeOperationError(this.getNode(), 'At least one of HTML, text, markdown, or attachments must be provided', {
                itemIndex: i,
              });
            }
            
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
              references?: string;
              conversation?: string;
              conversationSubject?: string;
              conversationColor?: string;
              team?: string;
              forceTeam?: boolean;
              organization?: string;
              addUsers?: string;
              addAssignees?: string;
              addSharedLabels?: string;
              removeSharedLabels?: string;
              addToInbox?: boolean;
              addToTeamInbox?: boolean;
              close?: boolean;
              reopen?: boolean;
              markAsUnread?: boolean;
              suppressNotifications?: boolean;
              system?: boolean;
            };
            
            const postData: any = {};
            
            // Add content fields if provided
            if (html) {
              postData.html = html;
            }
            
            if (text) {
              postData.text = text;
            }
            
            if (markdown) {
              postData.markdown = markdown;
            }
            
            // Add custom username fields
            const username = this.getNodeParameter('username', i, '') as string;
            if (username) {
              postData.username = username;
            }
            
            const usernameIcon = this.getNodeParameter('username_icon', i, '') as string;
            if (usernameIcon) {
              postData.username_icon = usernameIcon;
            }
            
            const conversationIcon = this.getNodeParameter('conversation_icon', i, '') as string;
            if (conversationIcon) {
              postData.conversation_icon = conversationIcon;
            }
            
            // Add notification if provided
            const notification = this.getNodeParameter('notification.value', i, null) as {
              title?: string;
              body?: string;
            } | null;
            
            if (notification) {
              postData.notification = {
                title: notification.title || '',
                body: notification.body || '',
              };
            }
            
            // Add additional fields if any
            if (additionalFields.references) {
              postData.references = additionalFields.references.split(',').map(ref => ref.trim());
            }
            
            if (additionalFields.conversation) {
              postData.conversation = additionalFields.conversation;
            }
            
            if (additionalFields.conversationSubject) {
              postData.conversation_subject = additionalFields.conversationSubject;
            }
            
            if (additionalFields.conversationColor) {
              postData.conversation_color = additionalFields.conversationColor;
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
            
            if (additionalFields.removeSharedLabels) {
              postData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());
            }
            
            if (additionalFields.addToInbox !== undefined) {
              postData.add_to_inbox = additionalFields.addToInbox;
            }
            
            if (additionalFields.addToTeamInbox !== undefined) {
              postData.add_to_team_inbox = additionalFields.addToTeamInbox;
            }
            
            if (additionalFields.close !== undefined) {
              postData.close = additionalFields.close;
            }
            
            if (additionalFields.reopen !== undefined) {
              postData.reopen = additionalFields.reopen;
            }
            
            if (additionalFields.markAsUnread !== undefined) {
              postData.mark_as_unread = additionalFields.markAsUnread;
            }
            
            if (additionalFields.suppressNotifications !== undefined) {
              postData.suppress_notifications = additionalFields.suppressNotifications;
            }
            
            if (additionalFields.system !== undefined) {
              postData.system = additionalFields.system;
            }
            
            // Handle attachments with all possible fields
            const attachmentItems = this.getNodeParameter('attachments.attachment', i, []) as Array<{
              binaryPropertyName: string;
              fileName: string;
              fields?: { field: Array<{ title: string; value: string; short: boolean }> };
              color?: string;
              pretext?: string;
              author_name?: string;
              author_link?: string;
              author_icon?: string;
              title?: string;
              title_link?: string;
              image_url?: string;
              text?: string;
              markdown?: string;
              timestamp?: number;
              footer?: string;
              footer_icon?: string;
            }>;
            
            if (attachmentItems && attachmentItems.length > 0) {
              const attachmentsData = [];
              
              for (const attachment of attachmentItems) {
                const attachmentData: any = {};
                
                // Handle file upload if binary property is provided
                if (attachment.binaryPropertyName) {
                  const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);
                  const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);
                  
                  const fileName = attachment.fileName || binaryData.fileName || 'unknown';
                  const mimeType = binaryData.mimeType || 'application/octet-stream';
                  
                  attachmentData.filename = fileName;
                  attachmentData.content_type = mimeType;
                  attachmentData.content = binaryDataBuffer.toString('base64');
                }
                
                // Add all the attachment metadata fields
                if (attachment.fields && attachment.fields.field) {
                  attachmentData.fields = attachment.fields.field.map(field => ({
                    title: field.title,
                    value: field.value,
                    short: field.short,
                  }));
                }
                
                if (attachment.color) attachmentData.color = attachment.color;
                if (attachment.pretext) attachmentData.pretext = attachment.pretext;
                if (attachment.author_name) attachmentData.author_name = attachment.author_name;
                if (attachment.author_link) attachmentData.author_link = attachment.author_link;
                if (attachment.author_icon) attachmentData.author_icon = attachment.author_icon;
                if (attachment.title) attachmentData.title = attachment.title;
                if (attachment.title_link) attachmentData.title_link = attachment.title_link;
                if (attachment.image_url) attachmentData.image_url = attachment.image_url;
                if (attachment.text) attachmentData.text = attachment.text;
                if (attachment.markdown) attachmentData.markdown = attachment.markdown;
                if (attachment.timestamp) attachmentData.timestamp = attachment.timestamp;
                if (attachment.footer) attachmentData.footer = attachment.footer;
                if (attachment.footer_icon) attachmentData.footer_icon = attachment.footer_icon;
                
                attachmentsData.push(attachmentData);
              }
              
              if (attachmentsData.length > 0) {
                postData.attachments = attachmentsData;
              }
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