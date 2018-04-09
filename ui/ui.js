/*
#
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
#
# Copyright (c) 2018 Juniper Networks, Inc.
# All rights reserved.
#
# Use is subject to license terms.
#
# Licensed under the Apache License, Version 2.0 (the ?License?); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at http://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
*/

var pollInterval = 5000;  // 1000 = 1 second, 3000 = 3 seconds
var ageOutInterval = "00:03:00" //H:M:S

$(document).ready(function () {

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href")
    });

    flowRouteAddNewConfigEventHandler();
    flowRouteModModalBtnEventHandler();
    flowRouteModBtnEventHandler();
    flowRouteDelBtnEventHandler();
    saveSettingsBtnEventHandler();

    var t_flow_config = $('#t_flow_config').DataTable({
        'ajax'       : {
            "type"   : "POST",
            "url"    : "/api/frct",
            "contentType": "application/json",
            "processData": true,
            "dataType": "json",
            "dataSrc": function (response) {

                var return_data = new Array();

                $.each( response[1], function( name, flow ) {

                    var action_val = new Array();

                     $.each( flow.action, function( action, value ) {

                        if (value['value'] === null){
                            action_val.push([action]);

                        } else {
                            action_val.push([action, value]);
                        }
                     });

                     return_data.push({
                        'name': name,
                        'dstPrefix': flow.dstPrefix,
                        'dstPort': flow.dstPort,
                        'srcPrefix': flow.srcPrefix,
                        'srcPort': flow.srcPort,
                        'protocol': flow.protocol,
                        'action': action_val
                        })
                });
                return return_data;
            }
        },
        "columns": [
            {
                "data": "name",
                "defaultContent": ""
            },
            {
                "data": "dstPrefix",
                "defaultContent": ""
            },
            {
                "data": "srcPrefix",
                "defaultContent": ""
            },
            {
                "data": "protocol",
                "defaultContent": ""
            },
            {
                "data": "dstPort",
                "defaultContent": ""
            },
            {
                "data": "srcPort",
                "defaultContent": ""
            },
            {
                "data": "action",
                "defaultContent": ""
            }]
    });

    var t_active_flow = $('#t_active_flow').DataTable({

            'ajax'       : {
                "type"   : "POST",
                "url"    : "/api/frt",
                "contentType": "application/json",
                "processData": true,
                "dataType": "json",
                "dataSrc": function (response) {

                    var return_data = new Array();

                    $.each( response[1], function( key, flow ) {

                        return_data.push({
                            'router': flow.router,
                            'term': flow.term,
                            'dstPrefix': flow.destination[0],
                            'dstPort': flow.destination[3],
                            'srcPrefix': flow.destination[1],
                            'srcPort': flow.destination[4],
                            'protocol': flow.destination[2],
                            'krtAction': flow.krtAction,
                            'commAction': flow.commAction,
                            'age': flow.age
                            })
                    });
                    return return_data;
                },
                "complete": function (response) {
                    getActiveFlowRoutes(pollInterval);
                }
            },
            "createdRow": function( row, data, dataIndex ) {

                if (data.age <= ageOutInterval) {
                    $(row).css( 'color', 'red' ).animate( { color: 'black' });


                }
            },
            "columns": [
                {
                    "data": "router",
                    "defaultContent": ""
                },
                {
                    "data": "term",
                    "defaultContent": ""
                },
                {
                    "data": "dstPrefix",
                    "defaultContent": ""
                },
                {
                    "data": "srcPrefix",
                    "defaultContent": ""
                },
                {
                    "data": "protocol",
                    "defaultContent": ""
                },
                {
                    "data": "dstPort",
                    "defaultContent": ""
                },
                {
                    "data": "srcPort",
                    "defaultContent": ""
                },
                {
                    "data": "krtAction",
                    "defaultContent": ""
                },
                {
                    "data": "commAction",
                    "defaultContent": ""
                },
                {
                    "data": "age",
                    "defaultContent": ""
                }]
        });

    var t_active_filter = $('#t_active_filter').DataTable({

        'ajax'       : {
            "type"   : "POST",
            "url"    : "/api/frft",
            "contentType": "application/json",
            "processData": true,
            "dataType": "json",
            "dataSrc": function (response) {

                var return_data = new Array();

                $.each( response[1], function( rname, router ) {
                    $.each(router, function( fidx, filter ) {

                        return_data.push({
                            'name': rname,
                            'dstPrefix': filter.data[0],
                            'dstPort': filter.data[3],
                            'srcPrefix': filter.data[1],
                            'srcPort': filter.data[4],
                            'protocol': filter.data[2],
                            'packetCount': filter.packet_count,
                            'byteCount': filter.byte_count
                        })
                    });
                });
                return return_data;
            }
        },
        "columns": [
            {
                "data": "name",
                "defaultContent": ""
            },
            {
                "data": "dstPrefix",
                "defaultContent": ""
            },
            {
                "data": "srcPrefix",
                "defaultContent": ""
            },
            {
                "data": "protocol",
                "defaultContent": ""
            },
            {
                "data": "dstPort",
                "defaultContent": ""
            },
            {
                "data": "srcPort",
                "defaultContent": ""
            },
            {
                "data": "packetCount",
                "defaultContent": ""
            },
            {
                "data": "byteCount",
                "defaultContent": ""
            }]
    });

    $("#t_flow_config tbody").on('click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            t_flow_config.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });

    $('#selectProtocol').on('change', function(){
        var selected = $(this).find("option:selected").val();

        if(selected === 'ICMP'){

            if ($('#g_icmp').length){
                $('#g_icmp').remove();
            }

            var html = "<div id=\"g_icmp\">" +
                "<label for=\"inputICMPCode\" class=\"col-sm-1 col-form-label\">Code</label>" +
                    "<div class=\"col-sm-2\">" +
                        "<input type=\"text\" class=\"form-control\" id=\"inputICMPCode\" placeholder=\"Code\">" +
                    "</div>" +
                "<label for=\"inputICMPType\" class=\"col-sm-1 col-form-label\">Type</label>" +
                    "<div class=\"col-sm-2\">" +
                        "<input type=\"text\" class=\"form-control\" id=\"inputICMPType\" placeholder=\"Type\">" +
                    "</div>" +
           "</div>";

            $('#fg_protocol').append(html);

        } else {

            if ($('#g_icmp').length){
                $('#g_icmp').remove();
            }
        }
    });

    $('#selectAction').on('change', function(){
        var selected = $(this).find("option:selected").val();

        if(selected === 'community'){

            if ($('#g_community').length){
                $('#g_community').remove();
            }

            var html = "<div id=\"g_community\"><label for=\"inputDstPort\" class=\"col-sm-2 col-form-label\">Community</label>" +
                            "<div class=\"col-sm-3\">" +
                                "<input type=\"text\" class=\"form-control\" id=\"inputActionCommunity\" placeholder=\"My BGP Community\">" +
                            "</div>" +
                       "</div>";

            $('#fg_action').append(html);

        } else {

            if ($('#g_community').length){
                $('#g_community').remove();
            }
        }
    });
});

function flowRouteAddNewConfigEventHandler(){

    $("#btnAddFlowRoute").on( "click", function() {
        var data = new Object();

        data.flowRouteName = $('#inputFlowRouteName').val();

        if ($('#inputSrcPrefix').val()){
            data.srcPrefix = $('#inputSrcPrefix').val();
        } else if ($('#inputSrcPort').val()){
            data.srcPort = $('#inputSrcPort').val();
        } else if ($('#inputDstPrefix').val()){
            data.dstPrefix = $('#inputDstPrefix').val();
        } else if ($('#inputDstPort').val()) {
            data.dstPort = $('#inputDstPort').val();
        } else if ($('#selectProtocol').val()) {
            data.protocol = $('#selectProtocol').val();
        }

        data.action = $('#selectAction').val();
        addNewFlowRouteConfig(data);
    });
}

function flowRouteModBtnEventHandler(){

    $('#btnModFlowRoute').click( function () {

        var data = new Object();

        data.flowRouteName = $('#inputModFlowRouteName').val();
        data.srcPrefix = $('#inputModSrcPrefix').val();
        data.srcPort = $('#inputModSrcPort').val();
        data.dstPrefix = $('#inputModDstPrefix').val();
        data.dstPort = $('#inputModDstPort').val();
        data.protocol = $('#selectModProtocol').val();
        data.action = $('#selectModAction').val();

        modFlowRouteConfig(data);
    });
}

function flowRouteModModalBtnEventHandler(){

    $('#flowModBtn').click( function () {

        var table = $('#t_flow_config').DataTable();
        var rowData = table.row( '.selected' ).data();

        $("#inputModFlowRouteName").val(rowData.name);
        $("#inputModDstPrefix").val(rowData.dstPrefix);
        $("#inputModSrcPrefix").val(rowData.srcPrefix);
        $("#selectModProtocol").val(rowData.protocol);
        $("#inputModDstPort").val(rowData.dstPort);
        $("#inputModSrcPort").val(rowData.srcPort);
        $("#selectModAction").val(rowData.action);
        $("#modalFlowMod").modal("toggle");
    });
}

function flowRouteDelBtnEventHandler(){

    $('#flowDelBtn').click( function () {
        var table = $('#t_flow_config').DataTable();
        var rowData = table.row( '.selected' ).data();
        delFlowRouteConfig(rowData.name);
    });
}

function addNewFlowRouteConfig(flowRouteData) {

    $.ajax({
        url: '/api?action=add',
        type: 'POST',
        data: JSON.stringify(flowRouteData),
        cache: false,
        processData: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {

            if (response[0]){

                $("#t_flow_config").DataTable().ajax.reload();
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    title: 'Successfully added new flow route',
                    message: response[1]
                })
            } else {

                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_WARNING,
                    title: 'Error adding new flow route',
                    message: response[1]
                })
            }
        },
        error : function (data, errorText) {
            $("#errormsg").html(errorText).show();
        }
    });
}

function modFlowRouteConfig(flowRouteData) {

    $.ajax({
        url: '/api?action=mod',
        type: 'POST',
        data: JSON.stringify(flowRouteData),
        cache: false,
        processData: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {

            console.log(response);

            if (response[0]){

                $("#t_flow_config").DataTable().ajax.reload();
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    title: 'Successfully modified flow route',
                    message: response[1]
                })
            }
        },
        error : function (data, errorText) {
            $("#errormsg").html(errorText).show();
        }
    });
}

function delFlowRouteConfig(flowRouteName){

    $.ajax({
        url: '/api?action=del',
        type: 'POST',
        data: JSON.stringify({"flowRouteName": flowRouteName}),
        cache: false,
        processData: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {

            if (response[0]){

                var table = $('#t_flow_config').DataTable();
                table.row('.selected').remove().draw( false );
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    title: 'Successfully deleted flow route',
                    message: response[1]
                })
            } else {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_WARNING,
                    title: 'Failed to delete flow route',
                    message: response[1]
                })
            }
        },
        error : function (data, errorText) {
            $("#errormsg").html(errorText).show();
        }
    });
}

function getActiveFlowRoutes(pollInterval){

    function poll() {
        var t = $('#t_active_flow').dataTable().api();
        t.ajax.reload()
    }
    setTimeout(poll, pollInterval);
}

function saveSettingsBtnEventHandler(){

    $("#saveDevSettingsBtn").on( "click", function() {

        var data = new Object();

        data.user = $('#inputDevUser').val();
        data.password = $('#inputDevPassword').val();
        data.ip = $('#inputDevIP').val();
        data.age_out_interval = $('#inputAgeOutInterval').val();
        pollInterval = $('#inputPollInterval').val();

        saveSettings(data);
    });
}

function saveSettings(settings){

    $.ajax({
        url: '/api?action=save',
        type: 'POST',
        data: JSON.stringify(settings),
        cache: false,
        processData: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
        },
        error : function (data, errorText) {
            $("#errormsg").html(errorText).show();
        }
    });
}