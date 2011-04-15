/*
 * 名前空間の定義方法については、
 * 	https://dev.mozilla.jp/2010/05/js-blockscope-and-namespace/
 *	http://archiva.jp/web/javascript/writing_style.html
 *	http://blog.zenbo.jp/article/13176556.html
 *	を参照。 
 * 
*/

//グローバルシンボルだけは宣言しておく。（既に使用済みでもvarは問題なし）  
var com;  
//プロパティがなかったら追加する。  //すでにある場合はオブジェクトかどうか判断して例外発生させた方がいいらしい  
if (!com) com = {};  
if (!com.makotoishida) com.makotoishida = {};  

com.makotoishida.JS15 = (function() { // 無名関数でスコープを形成する
	
	// この名前空間だけで使える変数はここでvarで定義
	var Cell_BGColor = "#08C";
	var Cell_BGColorHi = "#FFFFFF";
	var Cell_BGColorInvalid = "Red";
	var MoveSpeed = 300;

	// この名前空間だけで使える関数はここでvarで定義
	//	var privatefunc = function() { }; 

	// 名前空間オブジェクトをreturnする(これがグローバル変数com.makotoishida.JS15にセットされる)
	return { 
		// public変数
		Version: "1.0",
		
		// public関数（クラス）
		Puzzle: function(target_id, rows, cols, width, height) {
			var divMain = $("#" + target_id);
			var parentDiv = divMain.parents("#overLayer");
			var rowCount = rows; 
			var colCount = cols;
			var blankPanelNo = rows * cols;
			var widthMain = width;
			var heightMain = height;
			var w = (widthMain / colCount);
			var h = (heightMain / rowCount);

			//Panel配列を初期化
			var Panel = new Array(rowCount);
			for (var r = 0; r < rowCount; r++){
				Panel[r] = new Array(colCount);
				for (var c = 0; c < colCount; c++){
					Panel[r][c] = (r * rowCount) + c + 1;		//1,2,3,...16の数字を格納。
				}
			};
			
			//表示の初期化。
			var initPanel = function(){
				//パズル領域全体の幅と高さ。
				divMain.width(widthMain);
				divMain.height(heightMain);
				
				var scrTop = parentDiv.scrollTop();
				var scrLeft = parentDiv.scrollLeft();
				var off = divMain.position();
				var topMain = off.top + scrTop;
				var leftMain = off.left + scrLeft;

				//各Cellに対応するDIVを生成して初期位置に表示。
				var n = 1;
				for (var r = 0;r < rowCount; r++){
					for (var c = 0; c < colCount; c++){
						//DIVエレメントを生成。
						var div = $("<div id='cell" + n + "' class='js15_cell'>" + n + "</div>");

						//視覚効果のため、最初は画面全体に広がる様に配置
						var tp = r * (parentDiv.height() / (rowCount-1)); ;	
						var left =  c * (parentDiv.width() / (colCount-1)); 
						
						//位置と幅・高さをセット
						div.css({ width: w-4 + "px", 
								  height: h-4 + "px", 
								  top: tp + "px", 
								  left: left + "px"
								  });
						
						//行ごとにグラデーション効果を付ける。
						div.attr("mybgcolor", "#2"
												+ (15-Math.floor(14 * (r / rowCount))).toString(16)
												+ (15-Math.floor(6 * (r / rowCount))).toString(16) );
			
						if (n == blankPanelNo){
							div.css( { display:"none" } );
						}
						divMain.append(div);
						div.mousedown(cell_onclick);
						n++;
					}
				} 
			};

			//描画処理。
			var drawPanel = function(speed){
				var scrTop = parentDiv.scrollTop();
				var scrLeft = parentDiv.scrollLeft();
				var off = divMain.position();
				var topMain = off.top + scrTop;
				var leftMain = off.left + scrLeft;
	
				for (var r = 0;r < rowCount; r++){
					for (var c = 0; c < colCount; c++){
						var n = Panel[r][c];
						var div = divMain.find("#cell" + n);
						var tp = (r * h) + topMain +1;
						var left = (c * w) + leftMain +1;
			
						//移動されたかどうかの判断。（IEだと3ピクセルずれるので絶対値で判断。）
						if (Math.abs(div.position().left + scrLeft - left) > 3 
							 || Math.abs(div.position().top + scrTop - tp) > 3){
							
							//移動しながら背景色を変える。
							div.animate({ top: tp + "px", left: left + "px", 
										  backgroundColor: Cell_BGColorHi  }, speed, "swing");
							
							//移動完了後、背景色を元に戻す。
							//div.animate({ backgroundColor: Cell_BGColor }, speed*0.66, "linear");
							div.animate({ backgroundColor: div.attr("mybgcolor") }, speed*0.66, "linear");
						}
			
						if (n == blankPanelNo){
							div.css( { display:"none" } );
						}
					}
				} 
			};
			
			//シャッフル時のアニメーション効果
			var shuffleAnimation = function(speed){
				var scrTop = parentDiv.scrollTop();
				var scrLeft = parentDiv.scrollLeft();
				var off = divMain.position();
				var topMain = off.top + scrTop;
				var leftMain = off.left + scrLeft;

				//各Cellに対応するDIVを画面全体に散らばる様に移動。
				for (var r = 0;r < rowCount; r++){
					for (var c = 0; c < colCount; c++){
						var n = Panel[r][c];
						var div = divMain.find("#cell" + n);

						if (n == blankPanelNo){
							div.css( { display:"none" } );
						} else{
							
							//画面全体に散らばる様に配置
							var tp = r * (parentDiv.height() / (rowCount-1)); ;
							var left =  c * (parentDiv.width() / (colCount-1));
							
							//移動しながら背景色を変える。
							div.animate({ top: tp + "px", left: left + "px", 
										  backgroundColor: Cell_BGColorHi  }, speed, "swing");
						}
					}
				} 
			};

			//Panel配列の内容を入れ替える。
			var swapCell = function(r1, c1, r2, c2){
				var n = Panel[r1][c1];
				Panel[r1][c1] = Panel[r2][c2];
				Panel[r2][c2] = n; 
			};

			//指定の数字が入ったCellの座標を返す。
			var locateCell = function(n){
				for (var r = 0;r < rowCount; r++){
					for (var c = 0; c < colCount; c++){
						if (Panel[r][c] == n){
							return { row:r, col:c };
						}
					}
				}
				return null;
			};
			
			//空白Cellとの座標の差を返す。
			var offsetToBlank = function(r, c){
					var blank = locateCell(blankPanelNo);
					return { row:(blank.row - r), 
							 col:(blank.col - c) };
			};
			
			//デバッグ用にPanel配列の内容を表示。
			var dumpPanel = function(){
				var s = "";
				for (var r = 0; r < rowCount; r++){
					s = s + "\r" + r + ": "
					for (var c = 0; c < colCount; c++){
						s = s + Panel[r][c] + ", ";
					}
				}
				alert(s);
			};

			//終了判定
			var checkFinished = function(){
				var finished = true;
				var n = 1;
				
				for (var r = 0; r < rowCount; r++){
					for (var c = 0; c < colCount; c++){
						if (n != Panel[r][c]){
							finished = false;
						}
						n++;
					}
				}
				
				if (finished){
					setTimeout(function(){alert("Finished!!!");}, MoveSpeed*2);
				}
			}

			//Cellがクリック(実際にはMouseDown)された時の処理
			var cell_onclick = function(){
				var n = parseInt(this.id.replace("cell",""));   //thisはクリックされたCell(DIV)を指す。
				var pos = locateCell(n);
			
				var off = offsetToBlank(pos.row, pos.col);
				if ( off.row == 0 || off.col == 0 ){
					var dirY = off.row;
					if (dirY != 0) dirY = dirY / Math.abs(dirY);
					var dirX = off.col;
					if (dirX != 0) dirX = dirX / Math.abs(dirX);
			
					while (off.row != 0 || off.col != 0){
						swapCell( pos.row + off.row, 
								  pos.col + off.col, 
								  pos.row + off.row + dirY*-1, 
								  pos.col + off.col + dirX*-1);
						off.row += dirY*-1;
						off.col += dirX*-1;
					}
					drawPanel(MoveSpeed);
					checkFinished();
				} else {
					//クリックされた場所が動かせない場合、赤く点滅させる。
					$(this).animate({ backgroundColor: Cell_BGColorInvalid}, 100, 
							function(){$(this).animate({backgroundColor: Cell_BGColor}, 250);} );
				}
				return false;
			};
			
			var randomDir = function(){
				 return Math.floor( Math.random() * 3) -1;
			}
			
			//空白セルをランダムな方向に動かす
			var moveAtRandom = function(oldpos){
				var pos = locateCell(blankPanelNo);
				var newrow = 0;
				var newcol = 0;
				var done = false;
				
				while (!done){
					var dirY = randomDir();
					var dirX = randomDir();
					while( (dirY * dirX != 0) || (dirY == 0 && dirX == 0) ){
						dirY = randomDir();
						dirX = randomDir();
					}
					newrow = pos.row + dirY;
					newcol = pos.col + dirX;
					if ( newrow >=0 && newrow <= rowCount-1 
						  && newcol >= 0 && newcol <= colCount-1 
						  && (newrow != oldpos.row || newcol != oldpos.col) ){
						done = true;
					}
				}

				swapCell(pos.row, pos.col, newrow, newcol);
				return pos;
			};
			
			//シャッフル処理
			var shuffle = function(count, pos, callback){
				if (count == 0){
					callback();
					return;
				}
				if (pos == null){
					pos = {row: -1, col:-1};
				} 
				
				pos = moveAtRandom(pos);

				shuffle(count-1, pos, callback);
			}

			//画面を初期化
			initPanel();
			
			//画面全体に広がった状態から正しい初期位置に移動。通常よりもゆっくりと。
			drawPanel(2000);
			
			//シャッフルを実行
			shuffle(30, null, function(){
				shuffleAnimation(1000); 
				drawPanel(2000);}
			);
		}
	}; 
})(); // 無名関数を即時実行



