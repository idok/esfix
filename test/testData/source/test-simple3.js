define(['application/forms/restoreUtils', 'core', 'jquery', 'jqGrid', 'jqGridLocale'], function (ca, core, $) {
    'use strict';
    var $RSS = core.resMgr.strings;
    var CAApp = core.CAApp;
    var utils = core.utils;
    var CABreadCrumbs = core.CABreadCrumbs;
    var CABreadCrumb = core.CABreadCrumb;
    var TitlePanel = core.CAGrid.TitlePanel;
    var ContentEngine = core.ContentEngine;
    var DialogType = core.CAApp.DialogType;
    var CAPagingGrid = core.CAPagingGrid;


    var RestoreSnapshotServicesResults = {
        /**
         * @type {string}
         */
        source: null,
        /**
         * @type {string}
         */
        id: null,
        /**
         * @type {string}
         */
        alias: null,
        /**
         * @type {string}
         */
        account: null,
        /**
         * @type {string}
         */
        entity: null,

        /**
         * @type {Object<String, {img: String, text: String, breadcrumb: String}>}
         */
        GOOGLEAPPS: {
            GMAIL: {img: 'iconMail.png', text: 'Emails', breadcrumb: 'Emails'},
            GDOC: {img: 'iconDocs.png', text: 'Documents', breadcrumb: 'Documents'},
            GCONTACTS: {img: 'iconContacts.png', text: 'Contacts', breadcrumb: 'Contacts'},
            GTASK: {img: 'iconTasks.png', text: 'Tasks', breadcrumb: 'Tasks'},
            GCALENDAR: {img: 'iconCalendar.png', text: 'Calendar', breadcrumb: 'Calendars'},
            GSITES: {img: 'iconSites.png', text: 'Sites', breadcrumb: 'Sites'}
        },
        GACCOUNTS: {
            GMAIL: {img: 'iconMail.png', text: 'Emails', breadcrumb: 'Emails'},
            GDOC: {img: 'iconDocs.png', text: 'Documents', breadcrumb: 'Documents'},
            GCONTACTS: {img: 'iconContacts.png', text: 'Contacts', breadcrumb: 'Contacts'},
            GTASK: {img: 'iconTasks.png', text: 'Tasks', breadcrumb: 'Tasks'},
            GCALENDAR: {img: 'iconCalendar.png', text: 'Calendar', breadcrumb: 'Calendars'}
        },
        MS365: {
            O365MAIL: {img: 'iconMail.png', text: 'Emails', breadcrumb: 'Mail Box'},
            O365DOC: {img: 'iconDocs.png', text: 'Documents', breadcrumb: 'Documents'},
            O365CONTACTS: {img: 'iconContacts.png', text: 'Contacts', breadcrumb: 'Contacts'},
            O365TASKS: {img: 'iconTasks.png', text: 'Tasks', breadcrumb: 'Tasks'},
            O365CALENDAR: {img: 'iconCalendar.png', text: 'Calendar', breadcrumb: 'Calendars'}
        },

        /* Keep all the checked items for restore all downloads */
        /* Used also to check or uncheck when go to next or previous page */
        /**
         * @type {Object<String, {service: String, backupDate: Date, snapshotDate: Date}>}
         */
        checkedEntities: [],
        /**
         * @type {Number}
         */
        totalItems: NaN,
        /**
         * @type {string}
         */
        prevDate: ''
    };


    RestoreSnapshotServicesResults.start = function () {
        RestoreSnapshotServicesResults.source = ContentEngine.getPageParam('source');
        RestoreSnapshotServicesResults.id = ContentEngine.getPageParam('id');
        RestoreSnapshotServicesResults.alias = ContentEngine.getPageParam('alias');
        RestoreSnapshotServicesResults.account = ContentEngine.getPageParam('account');
        RestoreSnapshotServicesResults.entity = ContentEngine.getPageParam('entity');
        RestoreSnapshotServicesResults.beginDate = ContentEngine.getPageParam('begindate');
        RestoreSnapshotServicesResults.endDate = ContentEngine.getPageParam('enddate');

        var title = new TitlePanel($('#formTitle'));

        /* Bread crumbs */
        var crumbs = new CABreadCrumbs('breadcrumbs');
        var crumb = new CABreadCrumb('restoreSnapshotServicesResults', $RSS.restoreSnapshotServicesResults.breadcrumb, 'App#restore');
        crumbs.add(crumb);

        var url;

        if (CAApp.hasEntity(RestoreSnapshotServicesResults.source)) {
            var name = RestoreSnapshotServicesResults.alias;
            url = CAApp.appUrl("App#restoreItems", {source: RestoreSnapshotServicesResults.source, id: RestoreSnapshotServicesResults.id, account: RestoreSnapshotServicesResults.account, alias: RestoreSnapshotServicesResults.alias});
            crumb = new CABreadCrumb('restoreSnapshotServicesResults', name, url);
            crumbs.add(crumb);
        }

        url = CAApp.appUrl("App#restoreSearch", {source: RestoreSnapshotServicesResults.source, id: RestoreSnapshotServicesResults.id, account: RestoreSnapshotServicesResults.account, alias: RestoreSnapshotServicesResults.alias, entity: RestoreSnapshotServicesResults.entity});
        crumb = new CABreadCrumb('restoreSnapshotServicesResults', RestoreSnapshotServicesResults.entity, url);
        crumbs.add(crumb);

        crumb = new CABreadCrumb('restoreSnapshotServicesResults', $RSS.restoreSnapshotServicesResults.snapshots);
        crumbs.add(crumb);
        /* End Bread crumbs */

        title.setText(utils.trim($RSS.restoreSnapshotServicesResults.itemsTitle.format(RestoreSnapshotServicesResults.entity), 80));
        title.render();

        $('.cagridTitle span').attr('title', $RSS.restoreSnapshotServicesResults.itemsTitle.format(RestoreSnapshotServicesResults.entity));
        $(document).tooltip({ tooltipClass: "tooltip-title" });

        $('#labelDescription').html($RSS.restoreSnapshotServicesResults.descriptionLabel);

        RestoreSnapshotServicesResults.buildResultsGrid();

        storeSearchedTerms();
    };

    /* Keep searched terms in web storage or cookies for reselect after back action */
    function storeSearchedTerms() {
        if (typeof(Storage) !== "undefined") {
            var searchedTerms = {
                beginDateSnapshot: RestoreSnapshotServicesResults.beginDate,
                endDateSnapshot: RestoreSnapshotServicesResults.endDate,
                searchVia: 'snapshot'
            };
            sessionStorage.searchedTerms = JSON.stringify(searchedTerms);
        } else {
            /* for IE < 8 need to use cookies */
            document.cookie = "beginDateSnapshot=" + RestoreSnapshotServicesResults.beginDate;
            document.cookie = "endDatSnapshote=" + RestoreSnapshotServicesResults.endDate;
            document.cookie = "searchVia=snapshot";
        }
    }


    RestoreSnapshotServicesResults.buildResultsGrid = function () {
        var getData = {taskId: RestoreSnapshotServicesResults.id, account: RestoreSnapshotServicesResults.entity, fromDate: RestoreSnapshotServicesResults.beginDate, toDate: RestoreSnapshotServicesResults.endDate, rows: '50' };

        var gridData = {
            datatype: 'json',
            postData: getData,
            url: '/application/service/getSnapshots',
            jsonReader: {
                repeatitems: false,
                root: 'data',
                page: 'page',
                total: 'totalPages',
                records: 'total'
            },
            height: 'auto',
            width: 944,
            shrinkToFit: true,
            colNames: ['&nbsp;', 'Date', 'Time', 'Item', 'Action'],
            colModel: [
                {name: 'checkbox', index: 'checkbox', width: 29, title: false, resizable: false, classes: 'colCheckbox', fixed: true, align: 'center', sortable: false, formatter: checkboxFormatter},
                {name: 'dateTime', index: 'date', width: 280, title: false, resizable: false, sortable: false, formatter: dateFormatter},
                {name: 'timeTime', index: 'time', width: 234, title: false, resizable: false, sortable: false, formatter: timeFormatter},
                {name: 'subsource', index: 'item', width: 280, title: false, resizable: false, sortable: false, formatter: itemFormatter},
                {name: 'action', index: 'action', width: 100, title: false, resizable: false, sortable: false, formatter: actionFormatter}
            ],
            viewrecords: true,
            rowNum: 50,
            cellEdit: true,
            afterInsertRow: function(rowid, rowdata, rowelem) { rowComplete(rowid, rowdata); },
            loadComplete: function (response) { gridComplete(response.total); },
            pager: '#searchResultsGridContainer_pager',
            pagerpos: 'left',
            recordpos: 'left',
            pginput: 'false'
        };

        CAPagingGrid.build('#searchResultsGridContainer', {gridData: gridData, showFilter: false});
    };

    /* Formatter functions for all the needed columns */
    /**
     *
     * @param cellValue
     * @param options
     * @param rowObject
     * @return {String}
     */
    function checkboxFormatter(cellValue, options, rowObject) {
        var checkbox;
        var entityIndex = RestoreSnapshotServicesResults.checkedEntities.indexOf(rowObject.id);
        var d = new Date(rowObject.dateTime);
        var snapshotDate = ca.RestoreUtils.formatDate(d);

        var cssClass = 'ca-checkbox';
        var attr = 'entityId="' + rowObject.id + '" backupDate="' + rowObject.dateTime + '" service="' + rowObject.subsource + '" snapshotDate="' + snapshotDate + '"';

        if (entityIndex > -1) {
            cssClass += ' checked';
            attr += ' checked="checked"';
        }

        if(rowObject.subsource === 'GSITES') {
            checkbox = '<div class="' + cssClass + '">&nbsp;</div>';
        } else {
            checkbox = '<div class="' + cssClass + '" onclick="checkboxClick(this);"><input ' + attr + 'type="checkbox" /></div>';
        }

        return checkbox;
    }

    /**
     *
     * @param cellValue
     * @param options
     * @param rowObject
     * @return {String}
     */
    function dateFormatter(cellValue, options, rowObject) {
        return ca.RestoreUtils.formatDateNew(rowObject.dateTime);
    }

    /**
     *
     * @param cellValue
     * @param options
     * @param rowObject
     * @return {String}
     */
    function timeFormatter(cellValue, options, rowObject) {
        return ca.RestoreUtils.formatTimeNew(rowObject.dateTime);
    }

    /**
     *
     * @param cellValue
     * @param options
     * @param rowObject
     * @return {String}
     */
    function itemFormatter(cellValue, options, rowObject) {
        return '<div style="padding-left: 30px; width: 100%; height: 100%; background: url(\'images/app/service_icons/' + RestoreSnapshotServicesResults[RestoreSnapshotServicesResults.source][cellValue].img + '\') no-repeat left center">' + RestoreSnapshotServicesResults[RestoreSnapshotServicesResults.source][cellValue].text + '</div>';
    }

    /**
     *
     * @param cellValue
     * @param options
     * @param rowObject
     * @return {String}
     */
    function actionFormatter(cellValue, options, rowObject) {
        if (rowObject.indexed === false) {
            return $RSS.restoreSnapshotServicesResults.exploreLabel;
        }
        return CAApp.makeJsLink('clickExplore', [rowObject.subsource, rowObject.dateTime], $RSS.restoreSnapshotServicesResults.exploreLabel);
    }

    window.clickExplore = clickExplore;
    /**
     * Open a snapshot service
     * @param {String} service
     * @param {Date} backupDate
     */
    function clickExplore(service, backupDate) {
        //var dateTime = new Date(backupDate);
        //var backupDateFormat = ca.RestoreUtils.formatDateTime(dateTime);
        window.location.hash = 'restoreSnapshotResults/source/' + RestoreSnapshotServicesResults.source + '/id/' + RestoreSnapshotServicesResults.id + '/alias/' + RestoreSnapshotServicesResults.alias + '/account/' + RestoreSnapshotServicesResults.account + '/entity/' + RestoreSnapshotServicesResults.entity + '/backupdate/' + backupDate + '/service/' + service;
    }

    /**
     * After each grid row complete
     * If the current row dateTime and the previous row dateTime are different, add border-top for visual separation
     * @param {Number} rowid
     * @param {Object} rowdata
     */
    function rowComplete(rowid, rowdata) {
        var dateFormat = ca.RestoreUtils.formatDateLong(new Date(rowdata.dateTime));

        if (dateFormat !== RestoreSnapshotServicesResults.prevDate) {
            RestoreSnapshotServicesResults.prevDate = dateFormat;

            $('#' + rowid).find('td').each(function () {
                $(this).css('border-top', '1px solid #929292');
            });
        }
    }

    /**
     * After grid display is complete
     * Create / display jscrollpane for search results table
     * @param {Number} totalItems
     */
    function gridComplete(totalItems) {
        if (totalItems > 0) {
            //$('.ui-jqgrid-bdiv').css('max-height', '500px');
            if (RestoreSnapshotServicesResults.checkedEntities.length > 0) {
                ca.RestoreUtils.enableButton($('.buttonRestore'), clickRestore);
                ca.RestoreUtils.enableButton($('.buttonDownload'), clickDownload);
            }
        }

        //$('.ui-jqgrid-bdiv').jScrollPane({mouseWheelSpeed: 10, autoReinitialise: true});
    }

    window.checkboxClick = checkboxClick;
    /**
     * On checkbox click
     * @param {Object} checkbox
     */
    function checkboxClick(checkbox) {
        /* If is clicked a single checkbox */
        if ($(checkbox).hasClass('checked')) {
            /* If checkbox was checked and is unchecked */
            $(checkbox).removeClass('checked');
            $(checkbox).find('input').attr('checked', false);

            /* Remove this entityID from checkEntities array */
            var entityIndex = RestoreSnapshotServicesResults.checkedEntities.indexOf($(checkbox).find('input').attr('entityId'));

            if (entityIndex > -1) {
                RestoreSnapshotServicesResults.checkedEntities.splice(entityIndex, 1);
                //delete checkedEntities[$(checkbox).find('input').attr('entityId')];
            }
            if (RestoreSnapshotServicesResults.checkedEntities.length === 0) {
                $('.buttonRestore').addClass('buttonDisabled').unbind('click');
                $('.buttonDownload').addClass('buttonDisabled').unbind('click');
            }

        } else {
            /* If checkbox was unchecked and is checked */
            $(checkbox).addClass('checked');
            $(checkbox).find('input').attr('checked', true);

            /* Add this entityID to checkEntities array */
            RestoreSnapshotServicesResults.checkedEntities.push($(checkbox).find('input').attr('entityId'));
            RestoreSnapshotServicesResults.checkedEntities[$(checkbox).find('input').attr('entityId')] = {
                service: $(checkbox).find('input').attr('service'),
                backupDate: $(checkbox).find('input').attr('backupDate'),
                snapshotDate: $(checkbox).find('input').attr('snapshotDate')
            };

            if ($('.buttonRestore').hasClass('buttonDisabled')) {
                $('.buttonRestore').removeClass('buttonDisabled').click(clickRestore);
            }
            if ($('.buttonDownload').hasClass('buttonDisabled')) {
                $('.buttonDownload').removeClass('buttonDisabled').click(clickDownload);
            }
        }

        //console.log(checkedEntities);
    }

    function clearCheckboxes() {
        $('.ca-checkbox').each(function () {
            $(this).removeClass('checked');
            $(this).find('input').attr('checked', false);

            /* Remove all entitiesID from checkEntities array */
            var entityIndex = RestoreSnapshotServicesResults.checkedEntities.indexOf($(this).find('input').attr('entityId'));
            if (entityIndex > -1) {
                RestoreSnapshotServicesResults.checkedEntities.splice(entityIndex, 1);
            }
        });
        if (RestoreSnapshotServicesResults.checkedEntities.length === 0) {
            $('.buttonRestore').addClass('buttonDisabled').unbind('click');
            $('.buttonDownload').addClass('buttonDisabled').unbind('click');
        }
    }

    /* Dialog box when Restore button is clicked */
    function clickRestore() {
        var serviceExist = [];
        var restoreWarning = 0;

        /* Check if a Google Apps service is selected more than once from different date or same date */
        for (var i = 0; i < RestoreSnapshotServicesResults.checkedEntities.length; i++) {
            if (serviceExist.indexOf(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].service) === -1) {
                serviceExist.push(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].service);
            } else {
                restoreWarning = 1;
                break;
            }
        }

        if (restoreWarning === 1) {
            /* If same Google Apps service is selected more than once */
            var dialogData = {
                type: DialogType.YesNo,
                text: null,
                callback: null,
                title: ''
            };

            dialogData.text = $RSS.restoreSnapshotServicesResults.restoreConfirm;
            dialogData.callback = function () {
                //CAApp.closeModalDialog();
                closeWarning();
                openRestore();
            };

            CAApp.openDialog1(dialogData);
        } else {
            /* If all the selected Google Apps services are unique selected */
            openRestore();
        }
    }

    /* Close warning dialog popup */
    /* Because of the fadeOut effect, the CAApp.closeModalDialog() close also the restore dialog popup, not oly warning */
    function closeWarning() {
        $('#dialog_instance').hide();
        $('#dialog_instance').remove();
        $('#dialog_instance_modal_bg').hide();
        $('#dialog_instance_modal_bg').remove();
        $('#main_div').css('overflow', 'visible');
    }

    /* Open restore dialog popup */
    function openRestore() {
        var domain = RestoreSnapshotServicesResults.account.split('@');
        var entityDomain = RestoreSnapshotServicesResults.entity.split('@');

        var dialogData = {
            buttons: {buttonText: $RSS.res_str_dialog_ok},
            text: null,
            callback: null,
            title: $RSS.restoreSnapshotServicesResults.restoreTitle
        };

//    var months = $RSS.months;
        //var dateFormat = months[parseInt(currentSnapshotDate.substr(2,2))] + ' ' + currentSnapshotDate.substr(0,2) + ", " + currentSnapshotDate.substr(4,4);

        dialogData.text = $RSS.restoreSnapshotServicesResults.restoreDialog.format(RestoreSnapshotServicesResults.entity, entityDomain[0], domain[1]);
        dialogData.callback = function () {
            actionRestore();
            CAApp.closeModalDialog();
        };

        CAApp.openDialog1(dialogData);
    }


    /* Action (GET request to startRestoreOrDownload method) for restore */
    function actionRestore() {
        var domain = RestoreSnapshotServicesResults.account.split('@');
        var targetAccount = $('#userRestoreEmail').val() + '@' + domain[1];

        for (var i = 0; i < RestoreSnapshotServicesResults.checkedEntities.length; i++) {
            //var dateTime = new Date(parseInt(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate));
            //var backupDateFormat = ca.RestoreUtils.formatDateTimeSimple(dateTime);
            //var backupDateFormat = ca.RestoreUtils.formatDateTimeDateType(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate);
            var backupDateFormat = RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate;

            var dataSend = {type: 'RESTORE', account: RestoreSnapshotServicesResults.entity, targetAccount: targetAccount, source: RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].service, taskId: RestoreSnapshotServicesResults.id, date: backupDateFormat };

            $.ajax({
                type: 'POST',
                url: '/application/service/startRestoreOrDownload',
                data: JSON.stringify(dataSend)
            });
        }
        clearCheckboxes();
        _gaq.push(["Restore Task", "Created", RestoreSnapshotServicesResults.source]);
        window.location.hash = 'restore';
    }

    //window.radioClick = radioClick;
    /* Dialog box when Download button is clicked */
    /*function radioClick(radio) {
     if (!$(radio).hasClass('checked')) {
     $(radio).parent().find('.radio').each(function () {
     $(this).removeClass('checked');
     $(this).find('input').attr('checked', false);
     });
     $(radio).addClass('checked');
     $(radio).find('input').attr('checked', true);
     }
     }*/

    function clickDownload() {
        var dialogData = {
            buttons: {buttonText: $RSS.res_str_dialog_ok},
            text: null,
            callback: null,
            title: $RSS.restoreSnapshotServicesResults.downloadTitle
        };

        //var months = $RSS.restoreSnapshotServicesResults.months;
        //var dateFormat = months[parseInt(currentSnapshotDate.substr(2,2))] + ' ' + currentSnapshotDate.substr(0,2) + ", " + currentSnapshotDate.substr(4,4);

        $(document).tooltip();


        var radio1 = '<div class="radio checked"><input type="radio" name="downloadFormat" value="default" checked="checked"></div>';
        var tooltip1 = '<img id="downloadFormatHelp" class="formHelp" alt="' + $RSS.restoreSnapshotServicesResults.downloadTooltip + '" title="' + $RSS.restoreSnapshotServicesResults.downloadTooltip + '" src="images/app/controls/question.png">';
        var radio2 = '<div class="radio"><input type="radio" name="downloadFormat" value="PST"></div>';

        dialogData.text = $RSS.restoreSnapshotServicesResults.downloadDialog.format(RestoreSnapshotServicesResults.entity, radio1, tooltip1, radio2);
        dialogData.callback = function () {
            actionDownload();
            CAApp.closeModalDialog();
        };

        CAApp.openDialog1(dialogData);

        $('.dialog_content_text .radio').click(function(){
            ca.RestoreUtils.radioClick(this);
        });

        $('#dialog_modal_data .ca-checkbox').click(function () {
            if ($(this).hasClass('checked')) {
                $(this).removeClass('checked');
                $(this).find('input').attr('checked', false);
            } else {
                $(this).addClass('checked');
                $(this).find('input').attr('checked', true);
            }
        });
    }

    /* Action (GET request to startRestoreOrDownload method) for download */
    function actionDownload() {
        for (var i = 0; i < RestoreSnapshotServicesResults.checkedEntities.length; i++) {
            //var dateTime = new Date(parseInt(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate));
            //var backupDateFormat = ca.RestoreUtils.formatDateTimeSimple(dateTime);
            //var backupDateFormat = ca.RestoreUtils.formatDateTimeDateType(RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate);
            var backupDateFormat = RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].backupDate;

            var dataSend = {type: 'EXPORT', account: RestoreSnapshotServicesResults.entity, targetAccount: RestoreSnapshotServicesResults.entity, source: RestoreSnapshotServicesResults.checkedEntities[RestoreSnapshotServicesResults.checkedEntities[i]].service, taskId: RestoreSnapshotServicesResults.id, date: backupDateFormat };
            /* Export to PST format flag */
            if ($('[name="downloadFormat"][checked="checked"]').val() === 'PST') {
                dataSend.downloadToPst = true;
            } else {
                dataSend.downloadToPst = false;
            }

            $.ajax({
                type: 'POST',
                url: '/application/service/startRestoreOrDownload',
                data: JSON.stringify(dataSend)
            });
        }
        clearCheckboxes();
        _gaq.push(["Export Task", "Created", RestoreSnapshotServicesResults.source]);
        window.location.hash = 'restore';
    }

    RestoreSnapshotServicesResults.url = 'application/forms/restoreSnapshotServicesResults.htm';
    return RestoreSnapshotServicesResults;
});