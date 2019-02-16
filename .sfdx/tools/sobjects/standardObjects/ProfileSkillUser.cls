// This file is generated as an Apex representation of the
//     corresponding sObject and its fields.
// This read-only file is used by the Apex Language Server to
//     provide code smartness, and is deleted each time you
//     refresh your sObject definitions.
// To edit your sObjects and their fields, edit the corresponding
//     .object-meta.xml and .field-meta.xml files.

global class ProfileSkillUser {
    global List<AttachedContentDocument> AttachedContentDocuments;
    global List<CombinedAttachment> CombinedAttachments;
    global List<ContentDocumentLink> ContentDocumentLinks;
    global User CreatedBy;
    global Id CreatedById;
    global Datetime CreatedDate;
    global Integer EndorsementCount;
    global List<EntitySubscription> FeedSubscriptionsForEntity;
    global List<ProfileSkillUserFeed> Feeds;
    global List<ContentVersion> FirstPublishLocation;
    global List<ProfileSkillUserHistory> Histories;
    global Id Id;
    global Boolean IsDeleted;
    global User LastModifiedBy;
    global Id LastModifiedById;
    global Datetime LastModifiedDate;
    global String Name;
    global List<FeedComment> Parent;
    global List<ProcessInstance> ProcessInstances;
    global List<ProcessInstanceHistory> ProcessSteps;
    global ProfileSkill ProfileSkill;
    global Id ProfileSkillId;
    global List<ProfileSkillEndorsement> ProfileSkillUserEndorsements;
    global List<FeedItem> RelatedRecord;
    global Datetime SystemModstamp;
    global User User;
    global Id UserId;

    global ProfileSkillUser () 
    {
    }
}