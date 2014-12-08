define(['lodash', 'angular', 'listsSettings/app/listsSettingsModule'], function (_, ng, app) {
    'use strict';

    var allProxyList = ["Label", "ClippedParagraph", "ClippedParagraph2", "Date", "DateEdit", "TimeEdit", "InlineText", "InlineTextInput", "TextInput", "ErasableTextInput", "NumberInput", "NumericStepper", "CheckBox", "CheckBoxViewProxy", "RichTextEditor", "RichTextEditorInline", "Price", "EnumSelector", "Image", "Video", "VideoSelector", "VideoThumb", "ImageSelector", "ImageInput", "VerticalList", "FlowList", "MultiColumn", "VerticalListEditor", "DraggableListItem", "Box", "VBox", "HBox", "Field", "FieldBox", "TextField", "DataEditField", "Stack", "Css", "VSpacer", "HSpacer", "InlineSpacer", "HorizontalLine", "VerticalLine", "Switch", "SwitchBox", "OptionalArea", "SuperFlow", "Button", "Button2", "Table", "Deck", "TabMenu", "Icon", "StringArrayInput", "Toggle", "MusicPlayer", "AudioInput", "InlineSvg", "Link", "LinkSelector", "OptionsList", "SelectOptionsList", "OptionsListInput", "ComboBox", "RadioGroup", "CheckBoxGroup", "TextArea", "Area", "Container", "ZoomLink", "AppLink", "ZoomLayout", "FixedRatioLayout", "GoogleMap", "LocationSelector", "TagInput", "DragAndDropVList", "List2", "PaginatedList", "UnstyledLabel", "TooltipIcon", "Help", "IFrame", "ImageButton", "TPAGallery", "MediaRichTextEditorInline", "MediaLabel", "MediaThumb", "Gallery", "GridGallery", "SliderGallery", "ColumnGallery", "PaginatedColumnGallery"];

    app.controller('listsSettingsController', ['$scope', '$http', function listsSettingsController($scope, $http) {
        $scope.partId = "4de5abc5-6da2-4f97-acc3-94bb74285072";
        $scope.viewName = "MediaLeftPage";
        // $scope.partId = "1660c5f3-b183-4e6c-a873-5d6bbd918224";
        // $scope.viewName = "Gallery";
        $scope.direction = "rtl";
        $scope.activeCustomizations = [];
        $scope.format = "";

        function reApplyCustomizations() {
            _.each($scope.customizations, function (customization) {
                var matchingActive = _.find($scope.activeCustomizations, customization.rule);
                if (matchingActive) {
                    customization.value = matchingActive.value;
                } else {
                    customization.value = customization.input.defaultVal || "";
                }
                if (customization.input.name === "slider") {
                    customization.value = parseInt(customization.value) || 0;
                    customization.value = Math.max(Math.min(customization.value, customization.input.maxVal), customization.input.minVal);
                }
            });
        }

        function applyDefaultsFromDescriptor(view, customizationsSubset) {
            _.each(customizationsSubset, function (cust) {
                var base = view;
                if (!cust.input.defaultVal) {
                    var keyParts = cust.rule.key.split(".");
                    while (base && keyParts.length) {
                        base = base[keyParts.shift()];
                    }
                    if (base) {
                        console.log("Found default:", cust.rule.key, cust.rule.fieldId, base);
                        cust.input.defaultVal = base;
                    }
                }
            });
        }

        function recurseInViewAndCollectSubViewsAndAddDefaultValues(view, subViews, customizations) {
            var viewId = view.id || view.data;
            if (viewId && customizations[viewId]) {
                applyDefaultsFromDescriptor(view, customizations[viewId]);
            }
            if (!_.contains(allProxyList, view.comp.name)) {
                console.log('new view name', view.comp.name);
                // not a proxy a view
                subViews.push(view.comp.name);
            }
            var subNodes = view.comp.items || (view.comp.cases && _.flatten(_.values(view.comp.cases))) || [];
            _.each(subNodes, function (viewNode) {
                recurseInViewAndCollectSubViewsAndAddDefaultValues(viewNode, subViews, customizations);
            });
        }

        function collectCustomizationsOfView(viewName, collectedSubViews, view) {
            var customizations = {};
            _.each(view.customizations, function (cust) {
                customizations[cust.fieldId] = customizations[cust.fieldId] || [];
                cust = {
                    rule: {
                        viewName: viewName,
                        forType: view.forType,
                        format: cust.format || '',
                        fieldId: cust.fieldId,
                        key: cust.key
                    },
                    priority: cust.priority,
                    input: cust.input
                };
                customizations[cust.rule.fieldId].push(cust);
            });

            var subViewNames = [];

            recurseInViewAndCollectSubViewsAndAddDefaultValues(view, subViewNames, customizations);
            applyDefaultsFromDescriptor(view.vars, customizations.vars);

            var viewCustomizations = _(customizations)
                .values()
                .flatten()
                .value();

            var subViewCustomizations = _(subViewNames)
                .unique()
                .map(function (subViewName) {
                    return collectCustomizationsOfViewName(subViewName, collectedSubViews);
                }).value();
            return viewCustomizations.concat(subViewCustomizations);

        }

        function collectCustomizationsOfViewName(viewName, collectedSubViews) {
            collectedSubViews = collectedSubViews || [];
            if (_.contains(collectedSubViews, viewName)) {
                return [];
            }
            collectedSubViews.push(viewName);
            var viewsOfName = _.filter($scope.descriptor.views, function (view) {
                view.format = view.format || '';
                return view.name === viewName || _.contains(view.name, viewName);
            });
            var viewsGroupedByType = _.groupBy(viewsOfName, 'forType');
            _.map(viewsGroupedByType, function (viewsOfTypeInAllFormats, forType) {
                if (viewsOfTypeInAllFormats.length > 1) {
                    viewsGroupedByType[forType] = _.filter(viewsOfTypeInAllFormats, {
                        format: $scope.format
                    });
                }
            });

            return _(viewsGroupedByType)
                .values()
                .flatten()
                .map(_.partial(collectCustomizationsOfView, viewName, collectedSubViews))
                .flatten()
                .value();
        }


        function updateScopeWithViewAndDescriptor() {
            var part = _.find($scope.descriptor.parts, {
                id: $scope.partId
            });
            var viewsNames = part.views;
            $scope.viewsOptions = _.filter($scope.descriptor.viewDescriptions, function (viewDesc) {
                return _.contains(viewsNames, viewDesc.id);
            });
            var newCustomizations = collectCustomizationsOfViewName($scope.viewName);
            $scope.customizations = _(newCustomizations)
                .unique(function (cust) {
                    return [cust.rule.forType,
                            cust.rule.format,
                            cust.rule.fieldId,
                            cust.rule.key].join('|');
                })
                .sortBy('priority')
                .reverse()
                .value();
            reApplyCustomizations();
            console.log(JSON.stringify($scope.customizations, null, 2));

        }

        $http({
            method: 'GET',
            // url: 'http://static.parastorage.com/services/santa/1.173.0//static/wixapps/apps/menu/descriptor.json.js'
            url: 'http://static.parastorage.com/services/santa/1.173.0//static/wixapps/apps/blog/descriptor.json.js'
        }).success(function (descriptor) {
            $scope.descriptor = descriptor;
            console.log($scope.descriptor);
            $scope.$watch('viewName', updateScopeWithViewAndDescriptor);
            updateScopeWithViewAndDescriptor();
        });


        $scope.viewsOptions = [];
        $scope.customizations = [];


        console.log($scope.customizations);
        $scope.setCustomization = function (rule, value) {
            $scope.activeCustomizations = _.reject($scope.activeCustomizations, rule);
            $scope.activeCustomizations.push(_.extend({
                value: String(value)
            }, rule));
            console.log($scope.activeCustomizations);
        };
        $scope.debug = function () {
            console.log('activeCustomizations:', JSON.stringify($scope.activeCustomizations, null, 2));
            console.log('customizations:', JSON.stringify($scope.customizations, null, 2));
        };
    }

    ]);
});