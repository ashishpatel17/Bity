var _=require('underscore')._;

function GenericUtils() {
  this.GetStartIndexForPagination=function(perPageCount,pagNum){
		var intermediate=pagNum*perPageCount;
		var startIndex=intermediate-perPageCount
		return startIndex;
	};

	this.GetEndIndexForPagination=function(perPageCount,pagNum,totalItems){
		var intermediateItemCount=pagNum*perPageCount;
		var countOfItemsToBeSliced=0;
		if(intermediateItemCount>totalItems){
			countOfItemsToBeSliced=totalItems
		}else{
			countOfItemsToBeSliced=intermediateItemCount;
		}
		return countOfItemsToBeSliced;
	};
}

module.exports = GenericUtils;
