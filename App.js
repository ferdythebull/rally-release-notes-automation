Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    layout:{
    	type: 'vbox',
    	align: 'stretch'
    },
    componentCls: 'app',
    scopeType: 'release',
    comboboxConfig:{
    	fieldLabel: 'Select a Release:',
    	labelWidth: 100,
    	width: 300,
    	itemId:'release-combobox',
    	autoRender: true
    },
    
    scheduledStore: undefined,
    scheduledGrid: undefined,
    emailButton: undefined,

    onScopeChange: function() {
        var releaseFilter = this.getContext().getTimeboxScope().getQueryFilter();

        if(!this.scheduledStore){
        	this.scheduledStore = Ext.create('Rally.data.wsapi.artifact.Store',{
        		models: ['UserStory','Defect'],
        		autoLoad: true,
                storeConfig:{
                    context:{
                        project: "/project/4913344213",
                        projectScopeDown:"true",
                        projectScopeUp:"true",
                        workspace: "/workspace/615803530"
                    }
                },
        		filters:releaseFilter,
        		listeners: {
        			load: this._onDataLoaded,
        			scope: this
        		}
        	});
        } else {
        	this.scheduledStore.setFilter(releaseFilter);
        	this.scheduledStore.load({});
        };
    },

    _onDataLoaded: function(store, records){

    	if(records.length === 0){
    		return;
    	}

    	var myRecords = [];
    	_.each(records, function(record){
    		var obj = {
    			'Name': record.get('Name'),
    			'FormattedID': record.get('FormattedID'),
    			'Release': record.get('Release')._refObjectName
    		}
    		myRecords.push(obj);
    	});
        if(!this.scheduledGrid){
            this._createGrid(store);
        };
        if(!this.emailButton){
        	this._createEmailButton(myRecords);
        	this.add(this.emailButton);
        }else{
        	this.remove(this.emailButton);
        	this._createEmailButton(myRecords);
        	this.add(this.emailButton);
        };
    },

    //Create a UI Grid
    _createGrid: function(store){
        this.scheduledGrid = Ext.create('Rally.ui.grid.Grid',{
            store: store,
            columnCfgs: ['FormattedID', 'Name'],
            enableEditing: false
        });
        this.add(this.scheduledGrid);

        console.log(this.getContext().getDataContext());
    },

    _createEmailButton: function(myRecords){
        this.emailButton = Ext.create('Ext.Button',{
            text: 'Write Email',
            xtype: 'email-button',
            listeners: {
            	load: this._onDataLoaded,
            	scope: this
            },
            handler: function(){
       	        if(myRecords!=null){
    				console.log(myRecords);
    			};
                _createWindow
            	var myForm = Ext.create('Ext.window.Window',{
            		title: 'Write Email',
            		height: 250,
            		width: 400,
            		items:[{
            			xtype: 'fieldcontainer',
            			labelWidth: 100,
            			layout: 'anchor',
            			defaults: {
            				layout: 'fit'
            			},

            			fieldDefaults: {
            				msgTarget: 'under',
            				labelAlign: 'top'
            			},

            			items: [{
                            xtype: 'textfield',
            				fieldLabel: '<strong><em>Required</em></strong><br> Subject',
            				name: 'subject',
                            width: 300,
                            id: 'subject',
                            blankText: 'This field is required',
                            emptyText: "Write here..."
            			}, {
                            xtype: 'textareafield',
            				fieldLabel: '<strong><em>Optional</em></strong><br> Introductory Paragraph',
            				name: 'introductoryParagraph',
                            height: 100,
                            width: 300,
                            id: 'introductoryParagraph',
            				msgTarget: 'under',
                            emptyText: 'Introduce the release notes here...'
            			}]
            		}],
            		buttons: [{
            			text: 'Submit',
            			handler: function(){
                            var vals = {
                                'Subject' : Ext.getCmp('subject').getValue(),
                                'IntroductoryParagraph' : Ext.getCmp('introductoryParagraph').getValue()
                            };
                            myRecords.push(vals);
                            myRecords.filter(function(n){return n === 0 || n});

            				myForm.close();

            				Ext.Ajax.request({
    		            		// url: 'https://HERMES/MailApi/mails/sendMail',
    		            		method: 'POST',
    		            		params: {
    		            			requestParam: 'notInRequestBody'
    		            		},
    		            		success: function(){Ext.Msg.alert('success');},
    		            		failure: function(){Ext.Msg.alert('Failure to send message');},
    		            		jsonData:myRecords

		            	 });

                            myRecords = [];
            			}
            		}]
            	}).show();
            }
        });
    }
});