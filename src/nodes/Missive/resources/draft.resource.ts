import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import { IResourceHandler, baseUrl } from './base.resource';

export class DraftResource implements IResourceHandler {
  async execute(
    this: IExecuteFunctions,
    i: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData> {
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
      return { json: response };
    }
    
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
      return { json: response };
    }
    
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported.`);
  }
}