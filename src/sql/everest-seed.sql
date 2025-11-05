Truncate table document_types
INSERT INTO dbo.document_types (isDeleted,name,[level],isAssociatedIDReq,parentId,active,[hierarchy],createdBy,editedBy,createdAt,updatedAt) VALUES
	 (0,N' Retail Customer',0,NULL,NULL,NULL,N'CONSTANT',1,1,N'2022-06-16 09:00:48.681 +00:00',N'2022-06-16 09:02:19.825 +00:00'),
	 (0,N'Corporate Customer',0,NULL,NULL,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:01:04.953 +00:00',N'2022-06-16 09:01:04.953 +00:00'),
	 (1,N'Account Number ',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:03:13.658 +00:00',N'2022-06-16 09:03:36.923 +00:00'),
	 (1,N'Document Type',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:09:06.933 +00:00',N'2022-06-16 09:09:31.179 +00:00'),
	 (0,N'Account Opening Form',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:09:53.76 +00:00',N'2022-06-16 09:09:53.76 +00:00'),
	 (0,N'CIF ',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:10:10.596 +00:00',N'2022-06-16 09:10:10.596 +00:00'),
	 (0,N'POA Holder/Joint Account CIF',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:10:26.525 +00:00',N'2022-06-16 09:10:26.525 +00:00'),
	 (0,N'Citizenship',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:10:45.456 +00:00',N'2022-06-16 09:10:45.456 +00:00'),
	 (0,N'Passports',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:17:23.66 +00:00',N'2022-06-16 09:17:23.66 +00:00'),
	 (0,N'Driving License',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:17:40.987 +00:00',N'2022-06-16 09:17:40.987 +00:00'),
	 (0,N'Voter ID',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:17:58.399 +00:00',N'2022-06-16 09:17:58.399 +00:00'),
	 (0,N'Indian Government Issued Card',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:18:17.011 +00:00',N'2022-06-16 09:18:17.011 +00:00'),
	 (0,N'Institution ID',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:18:31.572 +00:00',N'2022-06-16 09:18:31.572 +00:00'),
	 (0,N'Birth Certificate',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:18:48.316 +00:00',N'2022-06-16 09:18:48.316 +00:00'),
	 (0,N'University Employee Card',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:19:00.616 +00:00',N'2022-06-16 09:19:00.616 +00:00'),
	 (0,N'Government Issued Other Card',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:19:11.678 +00:00',N'2022-06-16 09:19:11.678 +00:00'),
	 (0,N'Indian Embassy Registration Card',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:19:25.111 +00:00',N'2022-06-16 09:19:25.111 +00:00'),
	 (0,N'Government Issued Teacher Card ',1,NULL,1,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:19:36.607 +00:00',N'2022-06-16 09:19:36.607 +00:00'),
	 (0,N'Account Opening Form',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:20:02.742 +00:00',N'2022-06-16 09:20:02.742 +00:00'),
	 (0,N'CIF ',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:20:18.472 +00:00',N'2022-06-16 09:20:18.472 +00:00'),
	 (0,N'POA Holder/Authorised Signatory/Board of Directors/10% and above shareholders etc.CIF',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:20:37.874 +00:00',N'2022-06-16 09:20:37.874 +00:00'),
	 (0,N'Citizenship',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:20:53.493 +00:00',N'2022-06-16 09:20:53.493 +00:00'),
	 (0,N'Passports',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:21:07.413 +00:00',N'2022-06-16 09:21:07.413 +00:00'),
	 (0,N'Driving License',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:21:27.644 +00:00',N'2022-06-16 09:21:27.644 +00:00'),
	 (0,N'Voter ID',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:21:52.801 +00:00',N'2022-06-16 09:21:52.801 +00:00'),
	 (0,N'Indian Government Issued Card',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:22:07.001 +00:00',N'2022-06-16 09:22:07.001 +00:00'),
	 (0,N'Institution ID',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:22:21.178 +00:00',N'2022-06-16 09:22:21.178 +00:00'),
	 (0,N'Birth Certificate',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:22:33.276 +00:00',N'2022-06-16 09:22:33.276 +00:00'),
	 (0,N'Government Issued Other Card',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:22:47.654 +00:00',N'2022-06-16 09:22:47.654 +00:00'),
	 (0,N'Indian Embassy Registration Card',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:23:02.263 +00:00',N'2022-06-16 09:23:02.263 +00:00'),
	 (0,N'Registration Document',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:23:21.239 +00:00',N'2022-06-16 09:23:21.239 +00:00'),
	 (0,N'PAN/VAT',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:23:35.108 +00:00',N'2022-06-16 09:23:35.108 +00:00'),
	 (0,N'AOA',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:23:52.194 +00:00',N'2022-06-16 09:23:52.194 +00:00'),
	 (0,N'MOA',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:24:07.587 +00:00',N'2022-06-16 09:24:07.587 +00:00'),
	 (0,N'Tax Clearance Certificate',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:24:24.434 +00:00',N'2022-06-16 09:24:24.434 +00:00'),
	 (0,N'Shareholding Structure & BO Details',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:24:44.653 +00:00',N'2022-06-16 09:24:44.653 +00:00'),
	 (0,N'Etc. (Miscellaneous)',1,NULL,2,NULL,N'CONSTANT',1,NULL,N'2022-06-16 09:25:00.376 +00:00',N'2022-06-16 09:25:00.376 +00:00');

	 Truncate table document_indices
	 INSERT INTO dbo.document_indices (isDeleted,dataType,docId,label,[type],enum,validation,[condition],isRequired,isShownInAttachment,createdAt,updatedAt) VALUES
	 (0,N'number',1,N'Account Number ',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:04:01.891 +00:00',N'2022-06-16 09:04:01.891 +00:00'),
	 (0,N'string',1,N'CIF',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:05:46.238 +00:00',N'2022-06-16 09:05:46.238 +00:00'),
	 (0,N'string',1,N'Account Name',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:05:46.238 +00:00',N'2022-06-16 09:05:46.238 +00:00'),
	 (0,N'branch',1,N'Branch',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:05:46.238 +00:00',N'2022-06-16 09:05:46.238 +00:00'),
	 (0,N'string',1,N'Scheme Code',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:05:46.238 +00:00',N'2022-06-16 09:05:46.238 +00:00'),
	 (0,N'string',1,N'ID Number ',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:12:30.46 +00:00',N'2022-06-16 09:12:30.46 +00:00'),
	 (0,N'number',2,N'Account Number ',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:14:03.011 +00:00',N'2022-06-16 09:14:03.011 +00:00'),
	 (0,N'string',2,N'CIF',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:14:03.011 +00:00',N'2022-06-16 09:14:03.011 +00:00'),
	 (0,N'string',2,N'Account Name',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:14:03.011 +00:00',N'2022-06-16 09:14:03.011 +00:00'),
	 (0,N'branch',2,N'Branch',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:26:15.473 +00:00',N'2022-06-16 09:26:15.473 +00:00'),
	 (0,N'string',2,N'Scheme code ',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:26:15.473 +00:00',N'2022-06-16 09:26:15.473 +00:00'),
	 (0,N'number',2,N'Registration ID Number ',NULL,NULL,NULL,NULL,0,0,N'2022-06-16 09:26:15.473 +00:00',N'2022-06-16 09:26:15.473 +00:00');

	Truncate table location_maps
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BHOJPUR', '1', '1', '1', 'CONSTANT', '4/18/22', '11/25/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BIRATCHOWK', '1', '1', '1', 'CONSTANT', '4/19/22', '11/26/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BIRATNAGAR', '1', '1', '1', 'CONSTANT', '4/20/22', '11/27/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BIRTAMOD', '1', '1', '1', 'CONSTANT', '4/21/22', '11/28/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DAMAK', '1', '1', '1', 'CONSTANT', '4/22/22', '11/29/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DHARAN', '1', '1', '1', 'CONSTANT', '4/23/22', '11/30/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DHARAN EXTENSION COUNTER', '1', '1', '1', 'CONSTANT', '4/24/22', '12/1/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DUHABI', '1', '1', '1', 'CONSTANT', '4/25/22', '12/2/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'FIKKAL', '1', '1', '1', 'CONSTANT', '4/26/22', '12/3/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GAIGHAT', '1', '1', '1', 'CONSTANT', '4/27/22', '12/4/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'INARUWA', '1', '1', '1', 'CONSTANT', '4/28/22', '12/5/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'ITAHARI', '1', '1', '1', 'CONSTANT', '4/29/22', '12/6/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KANCHANBARI', '1', '1', '1', 'CONSTANT', '4/30/22', '12/7/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KANCHANPUR', '1', '1', '1', 'CONSTANT', '5/1/22', '12/8/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KHANDBARI', '1', '1', '1', 'CONSTANT', '5/2/22', '12/9/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'RAJBIRAJ', '1', '1', '1', 'CONSTANT', '5/3/22', '12/10/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MAHAKULUNG', '1', '1', '1', 'CONSTANT', '5/4/22', '12/11/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'OKHALDHUNGA', '1', '1', '1', 'CONSTANT', '5/5/22', '12/12/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SILICHONG', '1', '1', '1', 'CONSTANT', '5/6/22', '12/13/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BIRGUNJ', '1', '1', '1', 'CONSTANT', '5/7/22', '12/14/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'CHANDRANIGAHAPUR', '1', '1', '1', 'CONSTANT', '5/8/22', '12/15/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'HETAUDA', '1', '1', '1', 'CONSTANT', '5/9/22', '12/16/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'ICD', '1', '1', '1', 'CONSTANT', '5/10/22', '12/17/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KALAIYA', '1', '1', '1', 'CONSTANT', '5/11/22', '12/18/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SIMARA', '1', '1', '1', 'CONSTANT', '5/12/22', '12/19/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GARUDA', '1', '1', '1', 'CONSTANT', '5/13/22', '12/20/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JANAKPUR', '1', '1', '1', 'CONSTANT', '5/14/22', '12/21/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MAHENDRANAGAR DHANUSHA', '1', '1', '1', 'CONSTANT', '5/15/22', '12/22/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MIRCHAIYA', '1', '1', '1', 'CONSTANT', '5/16/22', '12/23/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'PIPRA', '1', '1', '1', 'CONSTANT', '5/17/22', '12/24/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BAGBAZAR', '1', '1', '1', 'CONSTANT', '5/18/22', '12/25/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BAGDOL', '1', '1', '1', 'CONSTANT', '5/19/22', '12/26/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BALAJU', '1', '1', '1', 'CONSTANT', '5/20/22', '12/27/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BANEPA', '1', '1', '1', 'CONSTANT', '5/21/22', '12/28/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BANESHWOR', '1', '1', '1', 'CONSTANT', '5/22/22', '12/29/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BATTAR', '1', '1', '1', 'CONSTANT', '5/23/22', '12/30/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BHAISEPATI', '1', '1', '1', 'CONSTANT', '5/24/22', '12/31/22');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BHAKTAPUR', '1', '1', '1', 'CONSTANT', '5/25/22', '1/1/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BUDHANILKANTHA', '1', '1', '1', 'CONSTANT', '5/26/22', '1/2/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'CHABAHIL', '1', '1', '1', 'CONSTANT', '5/27/22', '1/3/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'CORPORATE DEPOSIT CELL', '1', '1', '1', 'CONSTANT', '5/28/22', '1/4/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DHADING', '1', '1', '1', 'CONSTANT', '5/29/22', '1/5/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DHARKE', '1', '1', '1', 'CONSTANT', '5/30/22', '1/6/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DUPCHESHWOR', '1', '1', '1', 'CONSTANT', '5/31/22', '1/7/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GOLFUTAR', '1', '1', '1', 'CONSTANT', '6/1/22', '1/8/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GONGABU', '1', '1', '1', 'CONSTANT', '6/2/22', '1/9/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GWARKO', '1', '1', '1', 'CONSTANT', '6/3/22', '1/10/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JADIBUTI', '1', '1', '1', 'CONSTANT', '6/4/22', '1/11/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JAMAL', '1', '1', '1', 'CONSTANT', '6/5/22', '1/12/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JARANKHU', '1', '1', '1', 'CONSTANT', '6/6/22', '1/13/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JORPATI', '1', '1', '1', 'CONSTANT', '6/7/22', '1/14/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KADAGHARI', '1', '1', '1', 'CONSTANT', '6/8/22', '1/15/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KALIMATI', '1', '1', '1', 'CONSTANT', '6/9/22', '1/16/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KIRTIPUR', '1', '1', '1', 'CONSTANT', '6/10/22', '1/17/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LAGANKHEL', '1', '1', '1', 'CONSTANT', '6/11/22', '1/18/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LAZIMPAT', '1', '1', '1', 'CONSTANT', '6/12/22', '1/19/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MAHARAJGUNJ', '1', '1', '1', 'CONSTANT', '6/13/22', '1/20/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MAITIDEVI', '1', '1', '1', 'CONSTANT', '6/14/22', '1/21/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'NAXAL', '1', '1', '1', 'CONSTANT', '6/15/22', '1/22/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'NEWROAD', '1', '1', '1', 'CONSTANT', '6/16/22', '1/23/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'PULCHOWK', '1', '1', '1', 'CONSTANT', '6/17/22', '1/24/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SANOGAUN', '1', '1', '1', 'CONSTANT', '6/18/22', '1/25/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SATDOBATO', '1', '1', '1', 'CONSTANT', '6/19/22', '1/26/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SATUNGAL', '1', '1', '1', 'CONSTANT', '6/20/22', '1/27/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SINGHADURBAR COUNTER', '1', '1', '1', 'CONSTANT', '6/21/22', '1/28/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SITAPAILA', '1', '1', '1', 'CONSTANT', '6/22/22', '1/29/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TEKU', '1', '1', '1', 'CONSTANT', '6/23/22', '1/30/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'THAMEL', '1', '1', '1', 'CONSTANT', '6/24/22', '1/31/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'THIMI', '1', '1', '1', 'CONSTANT', '6/25/22', '2/1/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'HAKIM CHOWK', '1', '1', '1', 'CONSTANT', '6/26/22', '2/2/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KAWASOTI', '1', '1', '1', 'CONSTANT', '6/27/22', '2/3/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'NARAYANGARH', '1', '1', '1', 'CONSTANT', '6/28/22', '2/4/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'PARSA', '1', '1', '1', 'CONSTANT', '6/29/22', '2/5/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TANDI', '1', '1', '1', 'CONSTANT', '6/30/22', '2/6/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'AMARSINGH CHOWK', '1', '1', '1', 'CONSTANT', '7/1/22', '2/7/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BAGLUNG', '1', '1', '1', 'CONSTANT', '7/2/22', '2/8/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BESHISAHAR', '1', '1', '1', 'CONSTANT', '7/3/22', '2/9/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BIRUWA', '1', '1', '1', 'CONSTANT', '7/4/22', '2/10/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DAMAULI', '1', '1', '1', 'CONSTANT', '7/5/22', '2/11/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GORKHA', '1', '1', '1', 'CONSTANT', '7/6/22', '2/12/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KUSHMA', '1', '1', '1', 'CONSTANT', '7/7/22', '2/13/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LEKHNATH', '1', '1', '1', 'CONSTANT', '7/8/22', '2/14/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'POKHARA', '1', '1', '1', 'CONSTANT', '7/9/22', '2/15/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'POKHARA EXTENSION COUNTER', '1', '1', '1', 'CONSTANT', '7/10/22', '2/16/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SYANGJA', '1', '1', '1', 'CONSTANT', '7/11/22', '2/17/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BHAIRAHAWA', '1', '1', '1', 'CONSTANT', '7/12/22', '2/18/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BUTWAL', '1', '1', '1', 'CONSTANT', '7/13/22', '2/19/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BUTWAL EXTENSION COUNTER', '1', '1', '1', 'CONSTANT', '7/14/22', '2/20/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'CHANDRAUTA', '1', '1', '1', 'CONSTANT', '7/15/22', '2/21/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GHORAHI', '1', '1', '1', 'CONSTANT', '7/16/22', '2/22/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JEETPUR', '1', '1', '1', 'CONSTANT', '7/17/22', '2/23/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KHAIRENI', '1', '1', '1', 'CONSTANT', '7/18/22', '2/24/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KRISHNANAGAR', '1', '1', '1', 'CONSTANT', '7/19/22', '2/25/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LUMBINI', '1', '1', '1', 'CONSTANT', '7/20/22', '2/26/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MANIGRAM', '1', '1', '1', 'CONSTANT', '7/21/22', '2/27/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MURGIYA', '1', '1', '1', 'CONSTANT', '7/22/22', '2/28/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'PARASI', '1', '1', '1', 'CONSTANT', '7/23/22', '3/1/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SANDHIKHARKA', '1', '1', '1', 'CONSTANT', '7/24/22', '3/2/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TAULIHAWA', '1', '1', '1', 'CONSTANT', '7/25/22', '3/3/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'YOGIKUTI', '1', '1', '1', 'CONSTANT', '7/26/22', '3/4/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'NEPALGUNJ', '1', '1', '1', 'CONSTANT', '7/27/22', '3/5/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'KOHALPUR', '1', '1', '1', 'CONSTANT', '7/28/22', '3/6/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TULSIPUR', '1', '1', '1', 'CONSTANT', '7/29/22', '3/7/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'GULARIYA', '1', '1', '1', 'CONSTANT', '7/30/22', '3/8/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LAMAHI', '1', '1', '1', 'CONSTANT', '7/31/22', '3/9/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BANSGADHI', '1', '1', '1', 'CONSTANT', '8/1/22', '3/10/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SURKHET', '1', '1', '1', 'CONSTANT', '8/2/22', '3/11/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'RUKUM', '1', '1', '1', 'CONSTANT', '8/3/22', '3/12/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'ATTARIYA', '1', '1', '1', 'CONSTANT', '8/4/22', '3/13/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BAUNIYA', '1', '1', '1', 'CONSTANT', '8/5/22', '3/14/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DHANGADHI', '1', '1', '1', 'CONSTANT', '8/6/22', '3/15/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'JHALARI', '1', '1', '1', 'CONSTANT', '8/7/22', '3/16/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'LAMKI', '1', '1', '1', 'CONSTANT', '8/8/22', '3/17/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'MAHENDRANAGAR', '1', '1', '1', 'CONSTANT', '8/9/22', '3/18/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SHIKHAR', '1', '1', '1', 'CONSTANT', '8/10/22', '3/19/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SUKKHAD', '1', '1', '1', 'CONSTANT', '8/11/22', '3/20/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TIKAPUR', '1', '1', '1', 'CONSTANT', '8/12/22', '3/21/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'BAJHANG', '1', '1', '1', 'CONSTANT', '8/13/22', '3/22/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'DIPAYAL', '1', '1', '1', 'CONSTANT', '8/14/22', '3/23/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'SURMA', '1', '1', '1', 'CONSTANT', '8/15/22', '3/24/23');
	INSERT INTO location_maps (isDeleted,isActive,level,name,locationTypeId,createdBy,editedBy,hierarchy,createdAt,updatedAt) VALUES ('0', '1', '', 'TALKOT', '1', '1', '1', 'CONSTANT', '8/16/22', '3/25/23');


	




