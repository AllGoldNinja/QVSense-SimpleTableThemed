define(["jquery", "text!./simpletablethemed.css"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 10,
					qHeight : 50
				}]
			},
			striping : {
				freq : 0,
				groupA : 'White',
				groupB : 'LightGray'			
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1
				},
				measures : {
					uses : "measures",
					min : 0
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings",
					items : {
						initFetchRows : {
							ref : "qHyperCubeDef.qInitialDataFetch.0.qHeight",
							label : "Initial fetch rows",
							type : "number",
							defaultValue : 50
						},				
						striping : {
							type : "items",
							label : "Row Striping",
							items : {						
								rowStripe : {
									ref : "striping.freq",
									label : "Stripes",
									type : "number",
									defaultValue : 0
								},
								stripeColorA : {
									ref : "striping.groupA",
									label : "Stripe A",
									type : "string",
									defaultValue : "White"
								},
								stripeColorB : {
									ref : "striping.groupB",
									label : "Stripe B",
									type : "string",
									defaultValue : "LightGray"
								},
							}
						},
					}
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element) {
			var stripeSettings = this.backendApi.model.layout.striping;
			var stripeCount = this.backendApi.model.layout.striping.freq;
			//console.log(this.backendApi.model.properties.extraSettings.esStripes);
			var html = "<table><thead><tr>", self = this, lastrow = 0, morebutton = false;
			//render titles
			$.each(this.backendApi.getDimensionInfos(), function(key, value) {
				html += '<th>' + value.qFallbackTitle + '</th>';
			});
			$.each(this.backendApi.getMeasureInfos(), function(key, value) {
				html += '<th>' + value.qFallbackTitle + '</th>';
			});
			html += "</tr></thead><tbody>";
			
			//striping properties			
			var currCount = stripeCount,
				currGroup = 1,
				stripePair = [stripeSettings.groupA,stripeSettings.groupB];//TODO: add logic that will allow changing of color stripes
				
			//render data
			this.backendApi.eachDataRow(function(rownum, row) {
				lastrow = rownum;
				//for striping purposes
				if(currCount==0){
					currCount=stripeCount;
					currGroup = -(currGroup-1);
				}				
				
				html += '<tr';			
				//for striping purposes
				//TODO: add logic that will allow striping to be optional
				html += " style='";
				html += "background-color:"+stripePair[currGroup];
				html += "'";
				
				html+= '>';
				$.each(row, function(key, cell) {
					
					
					if(cell.qIsOtherCell) {
						cell.qText = self.backendApi.getDimensionInfos()[key].othersLabel;
					}
					html += '<td';					
					if(!isNaN(cell.qNum)) {
						html += " class='numeric'";
					}
					
					html += '>' + cell.qText + '</td>';
					
				});
				html += '</tr>';
				currCount--;
			});
			html += "</tbody></table>";
			//add 'more...' button
			if(this.backendApi.getRowCount() > lastrow + 1) {
				html += "<button id='more'>More...</button>";
				morebutton = true;
			}
			$element.html(html);
			if(morebutton) {
				var requestPage = [{
					qTop : lastrow + 1,
					qLeft : 0,
					qWidth : 10, //should be # of columns
					qHeight : Math.min(50, this.backendApi.getRowCount() - lastrow)
				}];
				$element.find("#more").on("qv-activate", function() {
					self.backendApi.getData(requestPage).then(function(dataPages) {
						self.paint($element);
					});
				});
			}
		}
	};
});
