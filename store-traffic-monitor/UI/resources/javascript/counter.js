/*
 * Authors: Mihaela Mihai <mihaela.mihai@rinftech.com>
 *          Stefan Andritoiu <stefan.andritoiu@gmail.com>
 * Copyright (c) 2018 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*URL for data.json file*/
var jsonUrl = 'resources/video_data/data.json';
var jsonVideoUrl = 'resources/video_data/videolist.json';
/*video frames url on local storage*/
var videoFramesUrl = 'resources/video_frames/';
/*video frame extension*/
var videoFramesExtension = '.jpg';

/*number of seconds it should grab images from disk*/
var readImagesIntervalDuration=1;
/*duration in seconds an image is shown*/
var frameDuration = 0.1;
/*time when last new frame was found*/
var newFrameFound = new Date();
/*if it doesn't find new frames for maximumDiffToFindFrame seconds, just stop the ajax call for frames*/
var maximumDiffToFindFrame = 30;

/*interval for pulling new frames id*/
var readImagesIntervalId;
var playInterval;

var timelineData = {
    start_time: 0,
    stop_time: 0,
    lines: {
    }
};

var videoHolderStructure =
    '<div class="col-sm-%SIZE% col-md-%SIZE% col-lg-%SIZE% col-xl-%SIZE%"><a class="btn btn-app playpause" data-videoid="%VIDEOID%"><i class="fa fa-pause"></i></a><section class="video" data-videoid="%VIDEOID%" data-videoname="%VIDEONAME%" width="100%"></section></div>';
var videoInfoboxStructure =
    '<div class="col-sm-%SIZE% col-md-%SIZE% col-lg-%SIZE% col-xl-%SIZE%">' +
    '<div class="row"> ' +
    '<div class="col-sm-12 col-md-12 col-lg-12 col-xl-12"> ' +
    '<div class="info-box"> ' +
    '<div class="info-box-content"> ' +
    '<span class="info-box-text">%VIDEONAME%</span> ' +
    '<span class="info-box-number" id="infobox-%VIDEOID%">0</span> ' +
    '</div> ' +
    '<!-- /.info-box-content --> ' +
    '</div> </div> </div> </div>';

var videosInPage = [];
const video = {
    "id": "",
    "duration": 0,
    "playing": false,
    "paused": false,
    "currentImageNumber": 1,
    "totalNumberOfImages": 100,
    "holder": "",
    "images": [],
    "counters": [],

    init: function (id, holder) {
        this.id=id;
        this.holder = holder;

        this.setDuration(0);
        this.setCurImgNo(0);
        this.setTotalNoOfImg(0);

        this.images = [];
        this.counters = [];

        return this;
    },
    setDuration: function(duration){
        this.duration = duration;
        return this;
    },
    setCurImgNo: function(currentImageNumber){
        this.currentImageNumber = currentImageNumber;
        return this;
    },
    setTotalNoOfImg: function(totalNumberOfImages){
        this.totalNumberOfImages = totalNumberOfImages;
        return this;
    },
    computeDuration: function () {
        var duration = this.totalNumberOfImages*frameDuration;
        return this.setDuration(duration);
    },
    getCurImgNo: function () {
        return this.currentImageNumber;
    },
    getNextImg: function () {
        //compute next image number
        var nextImgNo = this.getCurImgNo()+1;
        //hide all images
        $(this.holder+" img").attr('style', 'display:none');

        //get current image el and make it visible
        var el = $(this.holder+" img[data-videoframeid='"+this.id+'_'+nextImgNo+"']");
        if (el === undefined){
            alert("Error on getting next image; Please check video image numbering!");
            return;
        }
        el.attr("style", "display:block");

        //set new current image
        this.setCurImgNo(nextImgNo);
        //update infobox for image
        this.updateInfobox(nextImgNo);
    },
    getImageByNo: function(imageNo) {
        //hide all images
        $(this.holder+" img").attr('style', 'display:none');

        //get current image el and make it visible
        var el = $(this.holder+" img[data-videoframeid='"+this.id+'_'+imageNo+"']");
        if (el === undefined){
            alert("Error on getting image with the specified number!");
            return;
        }
        el.attr("style", "display:block");

        //set new current image
        this.setCurImgNo(imageNo);
        this.updateInfobox(imageNo);
    },
    updateInfobox: function(imageNo) {
        if (this.counters[imageNo] !== undefined) {
            $('span#infobox-'+this.id).html(this.counters[imageNo]);
        }
        return this;
    },
    getPaused: function () {
        return this.paused;
    },
    setPaused: function (paused) {
        this.paused = paused;
        return this;
    },
    getPlaying: function () {
        return this.playing;
    },
    setPlaying: function (playing) {
        this.playing = playing;
        return this;
    },
    play: function (){
        if (this.getPaused()) {
            return this;
        }
        if (this.playing == false && this.totalNumberOfImages > 0) {
            this.playing = true;
            this.getImageByNo(1);
        }
        else if (this.playing == true && this.totalNumberOfImages > 0 && this.currentImageNumber < this.totalNumberOfImages) {
            this.getNextImg();
        }
        else if(this.playing == true && this.totalNumberOfImages > 0 && this.currentImageNumber == this.totalNumberOfImages) {
            $($('a.playpause[data-videoid="' + this.id + '"] i')[0]).removeClass('fa-play').removeClass('fa-pause').addClass('fa-repeat');
        }

        return this;
    },
    pause: function() {
        this.paused = true;
    },
    autoplay: function() {

    }
};

/*used in order to determine the length of timelime*/
var durations = [];

var counter = {
    init: function () {
        $.getJSON(jsonUrl)
            .done(function(data) {
                var json = data;

                /**
                 * SET UP VIDEO HOLDERS
                 */

                if (json.totals === undefined) {
                    alert("Please add totals for videos");
                    return;
                }

                var totalVideos = Object.keys(json.totals).length;

                for (var videoId in json.totals) {
                    if (typeof videoId === 'string') {
                        //Generate HTML structure
                        var videoName = videoId.replace("_", " ");
                        var videoReplacements = {
                            "%SIZE%": parseInt(12/totalVideos),
                            "%VIDEOID%": videoId,
                            "%VIDEONAME%": videoName
                        };

                        var videoHolder = videoHolderStructure.replace(/%\w+%/g, function(all) {
                            return videoReplacements[all] || all;
                        });
                        var videoInfobox = videoInfoboxStructure.replace(/%\w+%/g, function(all) {
                            return videoReplacements[all] || all;
                        });

                        $("div.video-image-holder").append(videoHolder);
                        $("div.video-infobox").append(videoInfobox);

                        //Generate video object
                        var newVideo = Object.create(video);
                        newVideo.init(videoId, "section[data-videoid='"+videoId+"']");

                        videosInPage[videoId] = newVideo;
                    }
                }

                readImagesIntervalId = setInterval(counter.readImages, readImagesIntervalDuration*1000);
                playInterval = setInterval(counter.counterAutoPlay, frameDuration*1000);


                $('a.playpause i').on('click', function(){
                    var videoId = $(this).parent().attr('data-videoid');
                    var playpauserepeat = $(this).hasClass('fa-pause')?'01':($(this).hasClass('fa-play')?"10":'00');
                    if (videoId !== undefined) {
                        if (playpauserepeat == '10') {
                            counter.counterResume(videoId);
                        }
                        else if (playpauserepeat == '01'){
                            counter.counterPause(videoId);
                        }
                        else {
                            counter.counterRepeat(videoId);
                        }
                    }
                })
            })
            .fail(function(data){
                console.log("Data for videos could not be loaded!");
            });
    },
    readImages: function () {
        /*Stop interval if no new frames are gathered for difLastFrameFound seconds*/
        var currentDate = new Date();
        var difLastFrameFound = (currentDate - newFrameFound)/1000;

        if(difLastFrameFound > maximumDiffToFindFrame){
            window.clearInterval(readImagesIntervalId);
        }

        var dir = videoFramesUrl.trim();
        var fileextension = videoFramesExtension;

        $.getJSON(jsonVideoUrl)
            .done(function (data) {
                for (i in data) {
                    var filename = data[i].trim()+fileextension;
                    var videoFrameId = filename.slice(0, filename.length-fileextension.length).trim();

                    //check image doesn't exists already
                    if ($('img[data-videoframeid="'+videoFrameId+'"]').length == 0) {
                        newFrameFound = new Date();
                        var splitVideoFrameId = videoFrameId.split("_");

                        if (splitVideoFrameId.length !== 3) {
                            console.log('Wrong video frame name');
                            return;
                        }

                        var videoId = splitVideoFrameId[0].trim() + '_' + splitVideoFrameId[1].trim();
                        var videoHolder = $(videosInPage[videoId]['holder']);
                        if (videoHolder.length !== 0) {
                            videoHolder.append("<img src='" + dir + filename + "' data-videoframeid='"+videoFrameId+"' style='display: none;'>");
                            videosInPage[videoId].images.push(videoFrameId);
                        }
                    }
                }

                for (index in videosInPage) {
                    videosInPage[index].setTotalNoOfImg(videosInPage[index].images.length).computeDuration();
                }

                counter.generateTimelines();
            });
    },

    generateTimelines: function() {

        //reset timelinedata before reading it again
        timelineData = {
            start_time: 0,
            stop_time: 0,
            lines: {
            }
        };

        for (i  in videosInPage) {
            if (videosInPage[i].duration !== undefined) {
              /*  if (jQuery.inArray(videosInPage[i].duration, durations) == -1) {
                    durations.push(videosInPage[i].duration);
                }
*/
                if (jQuery.inArray(videosInPage[i].images.length, durations) == -1) {
                    durations.push(videosInPage[i].images.length);
                }

                var videoId = videosInPage[i].id;
                var videoName = videoId.replace("_", " ");

                if (timelineData.lines[videoId] == undefined) {
                    timelineData.lines[videoId] = {
                        title: videoName,
                        css: videoId,
                        events: [],
                        total: 0
                    }
                }
            }
        }

        timelineData.stop_time = Math.max.apply(Math,durations);

        $.getJSON(jsonUrl)
            .done(function(data) {
                var json = data;

                for (var i in json) {
                    if (timelineData.lines[i] !== undefined && jQuery.inArray(i, Object.keys(videosInPage)) !== -1 ) {
                        for (var idx in json[i]) {
                            /*timelineData.lines[i].events.push({
                                id: i+"_event_"+(timelineData.lines[i].events.length+1),
                                imageNo: idx,
                                time: idx*frameDuration,
                                counter: json[i][idx]
                            });
*/
                            timelineData.lines[i].events.push({
                                id: i+"_event_"+(timelineData.lines[i].events.length+1),
                                imageNo: idx,
                                time: idx,
                                counter: json[i][idx]['count'],
                                datetime: json[i][idx]['time']
                            });

                            //add to video counters
                            if (videosInPage[i] !== undefined) {
                                videosInPage[i]['counters'][idx] = json[i][idx]['count'];
                            }
                        }

                        timelineData.lines[i].total = json['totals'][i];
                    }
                }
                $('.tl').html('');
                $('.tl').timeline(timelineData);

                $("div.event div.circle").click(counter.onClickTimelineBullet);
            })
            .fail(function(data){
                console.log("Data for video could not be loaded!");
            });

    },

    onClickTimelineBullet: function () {
        if($(this).attr('data-videoid') === undefined || $(this).attr('data-eventtime') === undefined) {
            return;
        }

        var videoId = $(this).attr('data-videoid');
        var imageId = $(this).attr('data-eventimageno');

        if (videosInPage[videoId] !== undefined) {
            counter.counterPause(videoId);
            videosInPage[videoId].pause();
            videosInPage[videoId].getImageByNo(parseInt(imageId));
        }
    },

    counterAutoPlay: function() {
        for (i in videosInPage) {
            if (videosInPage[i].images.length > 0) {
                counter.counterPlay(i);
            }
        }
    },

    counterPlay: function(videoId) {
        if (videosInPage[videoId] !== undefined) {
            videosInPage[videoId].play();
        }
    },

    counterPause: function(videoId) {
        if (videosInPage[videoId] !== undefined) {
            videosInPage[videoId].pause();
            if($('a.playpause[data-videoid="'+videoId+'"] i').length > 0) {
                $($('a.playpause[data-videoid="'+videoId+'"] i')[0]).removeClass('fa-pause').removeClass('fa-repeat').addClass('fa-play');
            }
        }
    },

    counterResume: function(videoId) {
        if (videosInPage[videoId] !== undefined) {
            videosInPage[videoId].setPaused(false).play();
            if($('a.playpause[data-videoid="'+videoId+'"] i').length > 0) {
                $($('a.playpause[data-videoid="' + videoId + '"] i')[0]).removeClass('fa-play').removeClass('fa-repeat').addClass('fa-pause');
            }
        }
    },

    counterRepeat: function(videoId) {
        if (videosInPage[videoId] !== undefined) {
            videosInPage[videoId].setPlaying(false).play();
            if($('a.playpause[data-videoid="'+videoId+'"] i').length > 0) {
                $($('a.playpause[data-videoid="' + videoId + '"] i')[0]).removeClass('fa-play').removeClass('fa-repeat').addClass('fa-pause');
            }
        }
    }
};


$(document).ready(function () {
    counter.init();
});

if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}
