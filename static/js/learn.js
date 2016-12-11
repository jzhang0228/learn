(function() {

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  function getContainerHtml(character, index) {
    return '<div id="drop' + index + '" data-value="' + character + '" ' +
        'class="col-md-1 col-sm-2 col-xs-2 character-container">' +
        '<span class="glyphicon glyphicon-check hide" aria-hidden="true"></span>' +
        '<span class="glyphicon glyphicon-remove hide" aria-hidden="true"></span>' +
      '</div>';
  }

  function getCharacterHtml(character, index) {
    return '<div class="col-md-1 col-sm-2 col-xs-2 character-container">' +
        '<div id="drag' + index + '" data-value="' + character + '" class="character">' +
          character +
        '</div>' +
      '</div>';
  }

  function setCharacters(characters, selector, getHtmlCallBack) {
    var $container = $(selector);
    $container.html('');
    for (var i = 0; i < characters.length; i++) {
      var html = getHtmlCallBack(characters[i], i);
      $container.append(html);
    }
  }

  function newPlay(sentence) {
    setCharacters(sentence.split(""), '#main', getCharacterHtml);
    $('#startButton').removeAttr('disabled');
    $('#nextButton').attr('disabled', 'disabled');
    $('.character-container .glyphicon').addClass('hide');
  }

  function startPlay(sentence) {
    setCharacters(sentence.split(""), '#main', getContainerHtml);
    setCharacters(shuffle(sentence.split("")), '#sentence', getCharacterHtml);
    $('#startButton').attr('disabled', 'disabled');

    $('.character-container').droppable({
      hoverClass: "dash-border",
      drop: function(event, ui) {
        ui.draggable.detach().appendTo($(this));
        checkComplete();
      }
    });
    $('.character').draggable({
      helper: "clone",
      containment: "document"
    });
  }

  function checkComplete() {
    var containers = $('#main .character-container');
    for (var i = 0; i < containers.length; i++) {
      if ($(containers[i]).find('.character').length === 0) {
        return;
      }
    }
    $('#checkButton').removeAttr('disabled');
  }

  function checkResult() {
    var newClass;
    var succeed = true;
    var containers = $('#main .character-container');
    containers.find('.glyphicon').addClass('hide');
    for (var i = 0; i < containers.length; i++) {
      $container = $(containers[i]);
      $character = $container.find('.character');
      if ($character.attr('data-value') === $container.attr('data-value')) {
        newClass = 'bg-success';
        $container.find('.glyphicon-check').removeClass('hide');
      } else {
        newClass = 'bg-danger';
        $container.find('.glyphicon-remove').removeClass('hide');
        succeed = false;
      };
      $container.removeClass('bg-success');
      $container.removeClass('bg-danger');
      $container.addClass(newClass);
    }

    if (succeed) {
      $('#checkButton').attr('disabled', 'disabled');
      $('#nextButton').removeAttr('disabled');
    }
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getPraise() {
    const praises = [
      'Great Job', 'Good Job', 'Excellent', 'Fantastic', 'Wonderful', 'Super',
      'Marvelous', 'Brilliant', 'Awesome', 'Terrific', 'Well Done',
    ];
    return shuffle(praises)[0];
  }

  function showDoneMessage() {
    const DURATION = 1000;
    $('#main').html('<h1 id="done">' + getPraise() + '!</h1>');
    $('#done').css('text-shadow', "5px 5px 15px " + getRandomColor());
    $('#done').css('color', getRandomColor());
    $( "#done" ).animate({
      fontSize: "5em",
    }, DURATION);
  }

  $( document ).ready(function() {
    var index = 0;
    var text = $("#originalText").text().replace(/^[,.;，。：]+|[,.;，。：]+$/g, '');
    var sentences = text.split(/[,.;，。：]/);
    $(".ready-button").on('click touchstart', function(event) {
      $(this).addClass('hide');
      $(".action-buttons").removeClass('hide');
      newPlay(sentences[index]);
    });

    $("#startButton").on('click touchstart', function(event) {
      if ($(this).attr('disabled') === 'disabled') {
        return;
      }
      startPlay(sentences[index]);
    });

    $("#checkButton").on('click touchstart', function(event) {
      if ($(this).attr('disabled') === 'disabled') {
        return;
      }
      checkResult();
    });

    $("#nextButton").on('click touchstart', function(event) {
      if ($(this).attr('disabled') === 'disabled') {
        return;
      }
      $('#sentence').html('');
      $('#main').html('');
      index++;
      if (index >= sentences.length) {
        showDoneMessage();
      } else {
        newPlay(sentences[index]);
      }
    });
  });

})();
