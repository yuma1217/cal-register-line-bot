const createGcalLink = function(startDate, endDate){
    let title = ''
    let description = ''
    let place = ''
    //startDate = '20180914'    //'20180707T180000Z'
    //endDate = '20180915'     //'20130710T090000Z' //終日指定20130707/20130708
    let url = `https://www.google.com/calendar/event?action=TEMPLATE&text=${title}&details=${description}&location=${place}&dates=${startDate}/${endDate}`
    // &text=title, details=description, location=place, dates=
    return url
}

module.exports = createGcalLink