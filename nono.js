TILE_WIDTH = 20;
TILE_HEIGHT = 20;
TEXT_SIZE = Math.min(TILE_WIDTH, TILE_HEIGHT);

function main() {

  var sizeX = parseInt(getParameterByName('x'));
  var sizeY = parseInt(getParameterByName('y'));
  
  if(isNaN(sizeX) || isNaN(sizeY)) {
    sizeX = 10;
    sizeY= 10;
  }

  var win = false;

  createCanvas(sizeX, sizeY);
  var c = document.getElementById("nonoCanvas");

  realArray = generateArray(sizeX, sizeY, true);
  workArray = generateArray(sizeX, sizeY, false);
  clueArray = generateHints(realArray);

  drawGame(workArray, clueArray, win);

  down = false;

  c.addEventListener('mousedown', function(e) {
    if (!win) {
      downCoords = getGameCoords(e, sizeX, sizeY);
      if (downCoords !== null) {
        down = true;
        downVal = (workArray[downCoords[1]][downCoords[0]] + 1) % 3;
        workArray[downCoords[1]][downCoords[0]] = downVal;
      }
      drawGame(workArray, clueArray, win);
    }
  });

  c.addEventListener('mousemove', function(e) {
    if (!win && down) {
      coords = getGameCoords(e, sizeX, sizeY);
      if (coords !== null) {
        workArray[coords[1]][coords[0]] = downVal;
      }
      drawGame(workArray, clueArray, win);
    }

  });

  document.addEventListener('mouseup', function(e) {
    down = false;
    if (!win) {
      if (testWin(workArray, clueArray)) {
        win = true;
      }
    } else {
      realArray = generateArray(sizeX, sizeY, true);
      workArray = generateArray(sizeX, sizeY, false);
      clueArray = generateHints(realArray);
      win = false;
    }
    drawGame(workArray, clueArray, win);
  });

  document.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!win && !down) {
      downCoords = getGameCoords(e.touches[0], sizeX, sizeY);
      if (downCoords !== null) {
        down = true;
        downVal = (workArray[downCoords[1]][downCoords[0]] + 1) % 3;
        workArray[downCoords[1]][downCoords[0]] = downVal;
      }
      drawGame(workArray, clueArray, win);
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (!win && down) {
      coords = getGameCoords(e.touches[0], sizeX, sizeY);
      if (coords !== null) {
        workArray[coords[1]][coords[0]] = downVal;
      }
      drawGame(workArray, clueArray, win);
    }
  });

  document.addEventListener('touchend', function(e) {
    down = false;
    if (!win) {
      if (testWin(workArray, clueArray)) {
        win = true;
      }
    } else {
      realArray = generateArray(sizeX, sizeY, true);
      workArray = generateArray(sizeX, sizeY, false);
      clueArray = generateHints(realArray);
      win = false;
    }
    drawGame(workArray, clueArray, win);
  });

  window.addEventListener('resize', function(e) {
    resize(sizeX, sizeY);
    drawGame(workArray, clueArray, win);
  });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function createCanvas(xSize, ySize) {
  var c = document.createElement("canvas");
  c.setAttribute("id", "nonoCanvas");
  c.width = document.documentElement.clientWidth;
  c.height = document.documentElement.clientHeight;
  document.body.insertBefore(c, document.body.childNodes[0]);
  resize(xSize, ySize);
}

function resize(xSize, ySize) {
  xSize += Math.ceil(xSize / 2);
  ySize += Math.ceil(ySize / 2);
  tileSize = Math.min(document.documentElement.clientWidth / xSize, document.documentElement.clientHeight / ySize);

  TILE_WIDTH = tileSize;
  TILE_HEIGHT = tileSize;
  TEXT_SIZE = Math.min(TILE_WIDTH, TILE_HEIGHT);

  var c = document.getElementById("nonoCanvas");
  c.width = xSize * TILE_WIDTH + 4;
  c.height = ySize * TILE_HEIGHT + 4;
}

function getGameCoords(e, xSize, ySize) {
  var lmargin = Math.ceil(xSize / 2);
  var tmargin = Math.ceil(ySize / 2);
  var x;
  var y;
  var c = document.getElementById("nonoCanvas");

  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= c.offsetLeft;
  y -= c.offsetTop;

  x = Math.floor(x / TILE_WIDTH);
  y = Math.floor(y / TILE_HEIGHT);

  x -= lmargin;
  y -= tmargin;

  if (x >= 0 && x < xSize && y >= 0 && y < ySize) {
    return [x, y];
  } else {
    return null;
  }
}

function randomBoolean() {
  if (Math.random() > 0.5) {
    return 1;
  } else {
    return 0;
  }
}

function generateArray(xSize, ySize, random) {
  var arr = [];
  for (var y = 0; y < ySize; y++) {
    var inArr = [];
    for (var x = 0; x < xSize; x++) {
      if (random) {
        inArr.push(randomBoolean());
      } else {
        inArr.push(0);
      }
    }
    arr.push(inArr);
  }
  return arr;
}

function generateHints(arr) {
  var leftArr = [];
  for (var y = 0; y < arr.length; y++) {
    var stk = 0;
    var streaks = [];
    for (var x = 0; x < arr[0].length; x++) {
      if (arr[y][x] == 1) {
        stk++;
      } else if (stk !== 0) {
        streaks.push(stk);
        stk = 0;
      }
    }
    if (stk !== 0) {
      streaks.push(stk);
    }
    if (streaks.length === 0) {
      streaks = [0];
    }
    leftArr.push(streaks);
  }
  var topArr = [];
  for (x = 0; x < arr[0].length; x++) {
    var stk = 0;
    var streaks = [];
    for (y = 0; y < arr.length; y++) {
      if (arr[y][x] === 1) {
        stk++;
      } else if (stk !== 0) {
        streaks.push(stk);
        stk = 0;
      }
    }
    if (stk !== 0) {
      streaks.push(stk);
    }
    if (streaks.length === 0) {
      streaks = [0];
    }
    topArr.push(streaks);
  }
  return [leftArr, topArr];
}

function testWin(arr, hints) {
  var testHints = generateHints(arr);
  for (var i = 0; i < testHints.length; i++) {
    for (var j = 0; j < testHints[i].length; j++) {
      if (testHints[i].length != hints[i].length) {
        return false;
      }
      for (var k = 0; k < testHints[i][j].length; k++) {
        if (testHints[i][j].length != hints[i][j].length) {
          return false;
        }
        if (hints[i][j][k] == 1) {
          if (testHints[i][j][k] != 1) {
            return false;
          }
        } else {
          if (testHints[i][j][k] == 1) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function drawGame(arr, hints, win) {
  var c = document.getElementById("nonoCanvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  drawArray(arr, win);
  drawGrid(arr[0].length, arr.length);
  drawHints(arr[0].length, arr.length, hints);
}

function drawGrid(xSize, ySize) {
  var c = document.getElementById("nonoCanvas");
  var ctx = c.getContext("2d");
  var lmargin = Math.ceil(xSize / 2);
  var tmargin = Math.ceil(ySize / 2);
  for (var y = 0; y < ySize + 1; y++) {
    ctx.beginPath();
    ctx.moveTo((lmargin) * TILE_WIDTH, (tmargin + y) * TILE_HEIGHT);
    ctx.lineTo((lmargin + xSize) * TILE_WIDTH, (tmargin + y) * TILE_HEIGHT);
    if (y % 5 == 0) {
      ctx.strokeStyle = "#000000";
    } else {
      ctx.strokeStyle = "#666666";
    }
    ctx.closePath();
    ctx.stroke();
  }
  for (var x = 0; x < xSize + 1; x++) {
    ctx.beginPath();
    ctx.moveTo((lmargin + x) * TILE_WIDTH, (tmargin) * TILE_HEIGHT);
    ctx.lineTo((lmargin + x) * TILE_WIDTH, (tmargin + ySize) * TILE_HEIGHT);
    if (x % 5 == 0) {
      ctx.strokeStyle = "#000000";
    } else {
      ctx.strokeStyle = "#666666";
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawHints(xSize, ySize, hints) {
  var left = hints[0];
  var topH = hints[1];
  var lmargin = Math.ceil(xSize / 2);
  var tmargin = Math.ceil(ySize / 2);

  for (var y = 0; y < left.length; y++) {
    for (var x = left[y].length - 1; x >= 0; x--) {
      drawText(lmargin - (left[y].length - x), tmargin + y, left[y][x]);
    }
  }

  for (var x = 0; x < topH.length; x++) {
    for (var y = topH[x].length - 1; y >= 0; y--) {
      drawText(lmargin + x, tmargin - (topH[x].length - y), topH[x][y]);
    }
  }
}

function drawArray(arr, win) {
  var xSize = arr[0].length
  var ySize = arr.length
  var lmargin = Math.ceil(xSize / 2)
  var tmargin = Math.ceil(ySize / 2)
  for (y = 0; y < arr.length; y++) {
    for (x = 0; x < arr[0].length; x++) {
      if (arr[y][x] == 1) {
        drawSquare(x + lmargin, y + tmargin, win)
      } else if (arr[y][x] == 2) {
        drawCircle(x + lmargin, y + tmargin, win)
      } else if (win && arr[y][x] == 0) {
        drawCircle(x + lmargin, y + tmargin, win)
      }
    }
  }
}

function drawSquare(xCoord, yCoord, win) {
  var c = document.getElementById("nonoCanvas")
  var ctx = c.getContext("2d")
  if (win) {
    ctx.fillStyle = getRandColor()
  } else {
    ctx.fillStyle = "#000000"
  }
  ctx.fillRect(TILE_WIDTH * xCoord + 2,
    TILE_HEIGHT * yCoord + 2,
    TILE_WIDTH - 4,
    TILE_HEIGHT - 4);
}

function getRandColor() {
  return HSVtoRGB(Math.random(), 1, 1);
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v, g = t, b = p;
      break;
    case 1:
      r = q, g = v, b = p;
      break;
    case 2:
      r = p, g = v, b = t;
      break;
    case 3:
      r = p, g = q, b = v;
      break;
    case 4:
      r = t, g = p, b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
  }
  r = Math.round(r * 255)
  g = Math.round(g * 255)
  b = Math.round(b * 255)
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function drawCircle(xCoord, yCoord, win) {
  var c = document.getElementById("nonoCanvas")
  var ctx = c.getContext("2d")
  if (win) {
    ctx.fillStyle = "#eecccc"
  } else {
    ctx.fillStyle = "#660000"
  }
  ctx.beginPath();
  ctx.arc((TILE_WIDTH * xCoord) + (TILE_WIDTH / 2), (TILE_HEIGHT * yCoord) + (TILE_HEIGHT / 2), TILE_WIDTH / 4, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawText(xCoord, yCoord, text) {
  var c = document.getElementById("nonoCanvas")
  var ctx = c.getContext("2d")
  ctx.fillStyle = "#000000"
  ctx.font = TEXT_SIZE + "px Arial"
  ctx.textAlign = "center"
  ctx.fillText(text, TILE_WIDTH * (0.5 + xCoord), TILE_HEIGHT * (0.9 + yCoord))
}