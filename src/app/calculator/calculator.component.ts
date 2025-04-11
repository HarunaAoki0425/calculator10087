import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
    selector: 'app-calculator',
    standalone: true,
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.css'],
    imports: [CommonModule, FormsModule] 
})
export class CalculatorComponent {
    display: string = ''; // 表示されているもの
    prevIsOperator: boolean = false; // 直前が演算子かどうか
    resultDisplayed: boolean = false; // 計算結果が表示されたかどうか
    currentEquation: string = ''; // 現在の式
    lastResult: string = ' '; // 直前の計算結果

    // ボタンを押したときの処理
    press(value: string): void {

        // 計算結果が表示されてるとき、演算子以外が入力されたらクリア
        if (this.resultDisplayed && !this.isOperator(value)) {
            this.display = ''; // 数字・小数点の場合はクリア→次の計算、演算子の場合はその数字から続けて計算
        }
        
        // 計算結果が表示されているとき式を保存
        if (!this.resultDisplayed) {
          this.currentEquation = this.display;
        }

        // 計算結果が100以上のときはもうそれ以上計算は続けられない（演算子が押せない）
        if (this.resultDisplayed && this.isOperator(value)) {
          if (parseFloat(this.display) >= 10000000000 && this.isOperator(value)) {
            this.display = '100億以上の桁の数値が含まれる計算はできません';
            return;
        }
      }

        // エラー表示のときに演算子は入力不可にする
        if (
          (this.display === '0で割ることはできません' ||
           this.display === '結果が定義されていません' ||
           this.display === '100億以上の桁の数値が含まれる計算はできません' ||
           this.display === 'Error') &&
           this.isOperator(value)
           ) {
             return;
        }

        // 小数点の直後に演算子、小数点は入力不可
        const lastChar = this.display[this.display.length - 1];
        if (lastChar === '.' && (this.isOperator(value) || value === '.')) {
           return;
        }

        // -以外の演算子は計算の最初に入力できないようにする
        if (this.isOperator(value) && this.display === '' && value !== '-') {
             return;
        }


        // 上限を超えた数値は入力不可
        if (!this.canAddValue(value)) {
             return;
        }

        // 1--1を可能にするなら必要
        // -の連続は2つまで
        // if (value === '-') {
          //const secondLastChar = this.display[this.display.length - 2]; // 2番目に最後の文字
          //if (this.display.length === 1 && lastChar === '-') { // 最初に--は打てない
            //return;
          //}
           // すでに演算子が2つ続いている場合（+-や*-のあとにさらに-入力しようとしている）
          //if (this.isOperator(lastChar) &&this.isOperator(secondLastChar)) {
            //return; // 入力不可
          //}
        //}

        // 連続した--は+に変換
          //if (!this.isOperator(value) && !isNaN(Number(value)) || value === '.') {
            //const lastTwoChars = this.display.slice(-2); // 最後の'2文字を取り出す
            //if (lastTwoChars === '--') {
            // `--` が直前にあり、現在の入力が数字の場合
            //this.display = this.display.slice(0, -2) + '+'; // `--` を `+` に置き換えた後、数字を追加
            //}
        //}
   
        // 演算子は連続で入力できない（-は一度だけ連続入力可）
        if (this.isOperator(value)) { // 入力が演算子の場合
            if (this.isOperator(lastChar)) { // 直前が演算子の場合
               if (value === '-' && ['+', '*', '/', '÷', '×'].includes(lastChar)) { // 入力が-で、直前が-以外の演算子の場合  (1--1を可能にする場合は'-'を入れる)
              } // -は入力可能
              else {
               return; // その他の演算子連続はNG
              }
              }
         }

        // 最初に0が入力された場合、次に数字は入力できないようにする（演算子と小数点は入力できる）
        if (this.display === '0' && !(this.isOperator(value) || value === '.')) {
          return; 
        }

        // 直前が「0」で、その前が演算子の場合、数字の入力を防ぎ、演算子や小数点は入力できるようにする
        if (this.display[this.display.length - 1] === '0' && this.isOperator(this.display[this.display.length - 2])) {
          if (this.isOperator(value) || value === '.') {
          // 演算子または小数点は入力できる
          this.display += value;
           }
              return; // 数字だけ入力できない
        }

        //小数点が入力されるとき
        if (value === '.') { 
          // 直前が演算子か空欄の場合は0.と表示
          if (this.prevIsOperator || this.display === '') {
              this.display += '0.';
          } else {
              const parts = this.display.split(/[\+\-\*\/\÷\×]/);// 演算子で数値ごとに分割
              if (parts[parts.length - 1].includes('.')) {
                  return; // 分割した数値の中に小数点がある場合は入力不可
              }
              this.display += value;
          }
        } else {
          this.display += value;  // それ以外は通常の入力
      }
       
        this.prevIsOperator = this.isOperator(value);
        this.resultDisplayed = false;
        this.currentEquation = this.display;
    }

    // 計算
    evaluate(): void {

      // もし空欄なら何もしない
      if (this.display === '') {
         return;
      }
      // 最後が数値じゃない場合は計算しない（＝が入力できない）
      if (/[+\-*\/\÷\×.]$/.test(this.display)) {
         return; 
      }
      // 最初が-で、他に演算子が含まれていない場合は何もしない（-0=0を防ぐ）
      if (this.display.startsWith('-') && !/[+\-\*/\÷\×]/.test(this.display.slice(1))) {
         return;
      }

      // すでにエラーメッセージが表示されている場合は何もしない
      if (
         this.display === '0で割ることはできません' ||
         this.display === '結果が定義されていません' ||
         this.display === '100億以上の桁の数値が含まれる計算はできません' ||
         this.display === 'Error'
       ) {
         return;
      }

      // 「0/0」または「0/-0」が含まれるかチェック（どこにあっても）
      // 0/0と0で割るのが両方出てきた場合、0/0の処理を優先
      const undefinedPattern = /(^|[^0-9.])0÷-?0(?![\d.])/;
      const divideByZeroPattern = /÷-?0(?![\d.])/;
      // 0/0の場合
      if (undefinedPattern.test(this.display)) {
         this.display = '結果が定義されていません';
         this.resultDisplayed = true; //この後数字を押したら計算を開始できる
         return;
      }
      // 0で割る場合
      if (divideByZeroPattern.test(this.display)) {
         this.display = '0で割ることはできません';
         this.resultDisplayed = true; //この後数字を押したら計算を開始できる
         return;
      }

      // /を÷に、*を×に戻す
      const expression = this.display.replace(/÷/g, '/').replace(/×/g, '*');

      try {
          // 数式を評価
          const result = new Function('return ' + expression)();
          // 結果が数値であれば処理を行う
          if (typeof result === 'number') {
              if (Number.isInteger(result)) {
                  this.display = result.toString();  // 整数の場合はそのまま表示
              } else {
                this.display = parseFloat(result.toFixed(8)).toString(); // 小数点第9位以降は切り捨て
              }
              this.lastResult = this.display; // 直前の計算結果を保存
          } else {
            this.display = 'Error';// 結果が数値でないときはエラーと表示
          }
      } catch {
          this.display = 'Error'; // 予期せぬことが起こったらエラーと表示
      }
  
      this.resultDisplayed = true;
    }

     // 直前の入力を削除（⌫）
    deleteLast(): void {
      // 100億以上の桁の数値が含まれる計算はできませんの場合は直前の計算結果を表示
      if (this.display === '100億以上の桁の数値が含まれる計算はできません') {
          this.display = this.lastResult;
          this.resultDisplayed = true;
        return;
      }
      if (this.resultDisplayed) {
         // 計算結果が表示されているときは直前の計算式を復元
         this.display = this.currentEquation;
         this.resultDisplayed = false; // 計算結果が表示されていない状態に戻す
      } else {
         // 計算結果が表示されていない場合は、1文字削除
        this.display = this.display.slice(0, -1);
      }
         // 演算子の状態を更新
        this.prevIsOperator = this.isOperator(this.display.slice(-1));
    }

    // 直前の数値を削除（CE）
    clearEntry(): void {
      // 最後の演算子を取得
      const operatorIndex = this.display.search(/[\+\-\*\/\÷\×](?=[^+\-\*\/\÷\×]*$)/); 
      
      // 演算子がある場合
      if (operatorIndex !== -1) {
        const prevChar = this.display[operatorIndex - 1];// 演算子の直前の文字を確認（直前の数値が負の数か確認）
          if (prevChar && /[\+\-\*\/\÷\×]/.test(prevChar)) { // 直前が演算子の場合その演算子と数値を消す（1+-2→-2が消される）
          this.display = this.display.slice(0, operatorIndex - 1 + 1);
        } else {
          this.display = this.display.slice(0, operatorIndex + 1); 
        }
      } else {
          // 演算子がない場合、表示されているものをすべて消す
          this.display = '';
      }
  
      // 実行後は直前が演算子である状態にする
      this.prevIsOperator = true;
  }

    // 全部の表示をクリア（AC）
    clear(): void {
        this.display = '';
        this.prevIsOperator = false;
        this.resultDisplayed = false;
    }

    // + - * / の判定
    private isOperator(value: string): boolean {
        return ['+', '-', '*', '/', '÷', '×'].includes(value);
    }

    // 整数部分と小数部分を分けて上限を設定
    private canAddValue(value: string): boolean {
        const next = this.display + value; // 今ある入力+新しい入力
        const lastNumberMatch = next.match(/(\d+(\.\d*)?)$/);// 最後の数値部分だけ取り出す

        if (!lastNumberMatch) return true; // 取り出す数値がない場合（＝演算子）はそのまま表示

        const [integerPart, decimalPart] = lastNumberMatch[0].split('.'); // 小数点を境に整数と小数で分割

        // 整数部分が10桁以上または小数部分が8桁以上なら入力不可
        if (integerPart.length > 10 || (decimalPart && decimalPart.length > 8)) {
            return false;
        }
        // nextは数値であり、9999999999.99999999以下であることを確認（念のため）
        return !isNaN(parseFloat(next)) && parseFloat(next) <= 9999999999.99999999;
    }
}
