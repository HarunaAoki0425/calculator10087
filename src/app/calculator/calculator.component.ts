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
    display: string = '0'; // 表示されているもの、初期値0
    prevIsOperator: boolean = false; // 直前が演算子かどうか
    resultDisplayed: boolean = false; // 計算結果が表示されたかどうか
    currentEquation: string = ''; // 現在の式
    lastResult: string = ' '; // 直前の計算結果

    // ボタンを押したときの処理
    press(value: string): void {

       // 計算結果が表示されているときの処理
      if (this.resultDisplayed) { 
        if ( // エラー表示の時に演算子や小数点を押しても何も起こらない
          (this.display === '0で割ることはできません' ||
           this.display === '結果が定義されていません' ||
           this.display === '100億以上の桁の数値が含まれる計算はできません' ||
           this.display === 'Error') &&
           (this.isOperator(value) || value === '.')
           ) {
             return;
        }
        // 演算子が入力された場合
        if (this.isOperator(value)) { 
          if (parseFloat(this.display) >= 10000000000) { // 計算結果が100億以上の場合
            this.display = '100億以上の桁の数値が含まれる計算はできません'; // エラー文言
            return;
          }
          // 計算結果が100億未満で演算子が入力されたらその結果から次の計算を続ける
          this.display = this.lastResult; // 直前の計算結果を表示
          this.display += value;  // 演算子を追加
          this.resultDisplayed = false; // 計算結果が表示されていない状態に戻す
         } 
         // 数字が入力された場合
        else if (/\d/.test(value)) {
          this.display = value;  // 数字が入力されたら表示をリセットして、その数字から新たに計算を始める
          this.resultDisplayed = false; // 計算結果は表示されていない状態
          // 小数点が入力された場合
         } else if (value === '.') {
          if (parseFloat(this.display) >= 10000000000) { // 計算結果が100億以上の場合
            this.display = '100億以上の桁の数値が含まれる計算はできません'; // エラー文言
            return;
          }
          // 計算結果が100未満で小数点が含まれていない場合
          if (!this.display.includes('.') && parseFloat(this.display) < 10000000000) {
              this.display += value;  // 小数点を追加、その後の計算に使える
          }
          this.resultDisplayed = false; // 計算結果をクリア
         }
          return; // 計算結果が表示されているときはこれ以上の入力を処理しない
        }   
        
        // 入力中は式を保存
        if (!this.resultDisplayed) {
          this.currentEquation = this.display;
        }

        // 小数点の直後に演算子、小数点は入力不可
        const lastChar = this.display[this.display.length - 1]; // 直近の入力
        if (lastChar === '.' && (this.isOperator(value) || value === '.')) {
           return;
        }

        // 上限を超えた数値は入力不可
        if (!this.canAddValue(value)) {
             return;
        }
  

        // 最初の数字もしくは-は初期値の0を置き換えて表示
        if  (this.display === '0' ) {
          if (/\d/.test(value))  {// 数字の場合
            this.display = value;
            return;
          }
          if (value === '-') {// -の場合
            this.display = value;
            this.prevIsOperator = true; // 直前が演算子の状態
            return;
          }
        }

        // 演算子の入力
         const lastOperator = this.display.slice(-1); // 直前の演算子  
         const secondLastOperator = this.display.slice(-2, -1); // 直前の前の演算子
         const valueIsOperator = ['+', '-', '×', '÷'].includes(value); // 入力が演算子かどうか
         const lastTwoAreOperators = ['+', '-', '×', '÷'].includes(lastOperator) && ['+', '-', '×', '÷'].includes(secondLastOperator); // 直前とその前が演算子かどうか
         const combo = lastOperator + value; // 直前の演算子と入力を結合
         const firstIsNegative = /^-\d*\.?\d*$/.test(this.display);


        // 3つ以上演算子は連続で入力できない
        if (valueIsOperator && lastTwoAreOperators) {
           return;
        }

        switch (combo) {
        case '++':
        case '--':
        case '××':
        case '÷÷':
        // 同じ演算子が連続 → 無視
          return;
        
        case '-+':
        case '-×':
        case '-÷':
          if (firstIsNegative) return; // 最初が-なら変換不可
          this.display = this.display.slice(0, -1) + value;
          return;

        case '+-':
        case '+×':
        case '+÷':
        case '-+':
        case '-×':
        case '-÷':
        case '×+':
        case '×÷':
        case '÷+':
        case '÷×':
        // 置き換え
            this.display = this.display.slice(0, -1) + value;
            return;

        case '×-':
        case '÷-':
        // - はOKなのでそのまま追加
            break;

        default:
        // 直前が演算子かつ今回も演算子で combo に該当しないものがあれば、無視 
        if (['+', '-', '×', '÷'].includes(lastOperator) && ['+', '-', '×', '÷'].includes(value)) {
            return;
        }
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
          // 直前が演算子の場合は入力不可
          if (this.prevIsOperator) {
              return;
          }
          else {
              const parts = this.display.split(/[\+\-\×\÷]/);// 演算子で数値ごとに分割
              if (parts[parts.length - 1].includes('.')) {
                  return; // 分割した数値の中に小数点がある場合は入力不可
              }
              this.display += value;
          }
        } else {
          this.display += value;  // それ以外は通常の入力（ここですべての入力を表している））
      }
       
        this.prevIsOperator = this.isOperator(value);
        this.resultDisplayed = false; // 計算結果が表示されていない状態
        this.currentEquation = this.display; // 表示されている式は保存されている
    }

    // 計算
    evaluate(): void {

      // もし空欄なら何もしない
      if (this.display === '0') {
         return;
      }
      // 最後が数値じゃない場合は計算しない（＝が入力できない）
      if (/[+\-\×\÷.]$/.test(this.display)) {
         return; 
      }
      // 最初が-で、他に演算子が含まれていない場合は何もしない（-0=0を防ぐ）
      if (this.display.startsWith('-') && !/[+\-\×\÷]/.test(this.display.slice(1))) {
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
      const undefinedPattern = /(^|[^0-9.])0+(?:\.0+)?÷-?0+(?:\.0+)?(?![\d.])/; // 0/0
      const divideByZeroPattern = /÷-?0+(?:\.0+)?(?![\d.])/; // 0で割る
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

      // /を÷に、*を×に戻す、カンマを除く
      const expression = this.display.replace(/÷/g, '/').replace(/×/g, '*').replace(/,/g, '');

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
          this.display = this.lastResult; // 直前の計算結果を表示
          this.resultDisplayed = true; // 計算結果が表示されている状態にする
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
      if (this.display.length === 0) {
        this.display = '0'; // 最後の1文字を消した後は0を表示
        this.currentEquation = '';
    }    
         // 演算子の状態を更新
        this.prevIsOperator = this.isOperator(this.display.slice(-1));
    }

    // 直前の数値を削除（CE）
    clearEntry(): void {
      // 初期値から置き換えられた-しかない場合は何もしない
      if (this.display === '-') {
        return;
      }
      // 直近が演算子2つ（例: 1*-）の場合は何もしない
      if (this.display.match(/[\+\-\×\÷]{2}$/)) {
          return;
       }
      // 最後の演算子を取得
      const operatorIndex = this.display.search(/[\+\-\×\÷](?=[^+\-\×\÷]*$)/); 
      
      // 演算子がある場合
      if (operatorIndex !== -1) {
        const prevChar = this.display[operatorIndex - 1];// 演算子の直前の文字を確認（直前の数値が負の数か確認）
          if (prevChar && /[\+\-\×\÷]/.test(prevChar)) { // 直前が演算子の場合その演算子と数値を消す（1+-2→-2が消される）
          this.display = this.display.slice(0, operatorIndex - 1 + 1);
        } else {
          this.display = this.display.slice(0, operatorIndex + 1); 
        }
      } else { // 演算子がない場合（＝数字のみの場合）全削除
         this.display = '0';
         this.prevIsOperator = false;
         this.resultDisplayed = false;
         this.currentEquation = ''
         return;
      }
      if (this.display.startsWith('-') || this.resultDisplayed) { // 負の数のみの入力もしくは計算結果が表示されている場合全削除
          this.display = '0';
          this.prevIsOperator = false;
          this.resultDisplayed = false;
          this.currentEquation = ''; 
          return;
        }
      // 実行後は直前が演算子である状態にする
      this.prevIsOperator = true;
     }

    // 全部の表示をクリア（AC）
    clear(): void {
        this.display = '0';
        this.prevIsOperator = false;
        this.resultDisplayed = false;
        this.currentEquation = '';
    }

    // カンマ付きの表示
    displayWithCommas(): string {
      // エラー文言のときはそのまま
      if (
        this.display === '0で割ることはできません' ||
        this.display === '結果が定義されていません' ||
        this.display === '100億以上の桁の数値が含まれる計算はできません' ||
        this.display === 'Error'
      ) {
        return this.display;
      }
    
      // 数式中の数値を1つずつカンマ付きに変換
      return this.display.replace(/(\d+)(\.\d+)?/g, (_, intPart, decimalPart) => {
        const withCommas = Number(intPart).toLocaleString();
        return decimalPart ? withCommas + decimalPart : withCommas;
      });
    }
    

    // 演算子の判定
    private isOperator(value: string): boolean {
        return ['+', '-', '×', '÷'].includes(value);
    }

    // 整数部分と小数部分を分けて上限を設定
    private canAddValue(value: string): boolean {
        const next = (this.display + value).replace(/,/g, ''); // 今ある入力+新しい入力
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

     
