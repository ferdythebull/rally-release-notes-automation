Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'release',
    comboboxConfig:{
    	fieldLabel: 'Select a Release:',
    	labelWidth: 100,
    	width: 300
    },

    scheduledStore: undefined,
    scheduledGrid: undefined,
    emailButton: undefined,

    _getFilters: function(){
        var releaseFilter = this.getContext().getTimeboxScope().getQueryFilter();

        this.onScopeChange(releaseFilter);
    },

    onScopeChange: function(releaseFilter) {
        var releaseFilter = this.getContext().getTimeboxScope().getQueryFilter();

        if(!this.scheduledStore){
        	this.scheduledStore = Ext.create('Rally.data.wsapi.artifact.Store',{
        		models: ['UserStory','Defect'],
        		autoLoad: true,
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
    },

    _createEmailButton: function(myRecords){
        this.emailButton = Ext.create('Ext.Button',{
            text: 'Send Email',
            listeners: {
            	load: this._onDataLoaded,
            	scope: this
            },
            handler: function(){
       	        if(myRecords!=null){
    				console.log(myRecords);
    			};
            	alert('The email has been sent!');

            	Ext.Ajax.request({
            		url: 'http://localhost:8080/MailApi/mails/sendMail',
            		method: 'POST',
            		params: {
            			requestParam: 'notInRequestBody'
            		},
            		success: function(){console.log('success');},
            		failure: function(){Ext.Msg.alert('Failure to send message');},
            		jsonData:myRecords
            	});
            }
        });
    }

});