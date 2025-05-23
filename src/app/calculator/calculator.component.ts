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
    lastResult: string = ' '; // 直前の計算結果
    displayIsEmpty: boolean = true; // 表示が空欄かどうか

    // ボタンを押したときの処理
    press(value: string): void {

       // 計算結果が表示されているときの処理
      if (this.resultDisplayed) { 
        if ( // エラー表示の時に演算子や小数点を押しても何も起こらない
          (this.display === '0で割ることはできません' ||
           this.display === '結果が定義されていません' ||
           this.display === '100億以上の計算結果は表示できません' ||
           this.display === '-100億以下の計算結果は表示できません' ||
           this.display === 'Error') &&
           (this.isOperator(value) )
           ) {
             return;
        }
        // 演算子が入力された場合
        if (this.isOperator(value)) { 
          // 計算結果が100億未満で演算子が入力されたらその結果から次の計算を続ける
          this.display = this.lastResult; // 直前の計算結果を表示
          this.display += value;  // 演算子を追加
          this.resultDisplayed = false; // 計算結果が表示されていない状態に戻す
         } 
         // 数字が入力された場合
        else if (/\d/.test(value)) {
          this.display = value;  // 数字が入力されたら表示をリセットして、その数字から新たに計算を始める
          this.resultDisplayed = false; // 計算結果は表示されていない状態
         } 
         // 小数点が入力された場合
        else if (value === '.') {
           this.display = '0.'; // 小数点を入力したら0.から新たに計算を始める
           this.resultDisplayed = false; // 計算結果をクリア
         }
          return; // 計算結果が表示されているときはこれ以上の入力を処理しない
        }   

        // 小数点の直後に演算子と小数点は入力不可
        const lastChar = this.display[this.display.length - 1]; // 直近の入力
        if (lastChar === '.' && (this.isOperator(value) || value === '.')) {
           return;
        }

        // 上限を超えた数値は入力不可
        if (!this.canAddValue(value)) {
             return;
        }
  
        // 最初の数字は初期値０を置き換えて表示
        if (this.display === '0' && /\d/.test(value))  {
            this.display = value;
            this.displayIsEmpty = false; // 表示が空欄でないことを示す
            return;
        }

        // 初期値のときに-が押されたら（-と0-の場合分け）
        if (this.display === '0' && value === '-') {
            if (this.displayIsEmpty === true) { // 表示が空欄の場合
            this.display = value; // 初期値０を置き換えて表示
            this.prevIsOperator = true; // 直前が演算子の状態
            return;
           }
           else { // 表示が空欄でない場合（直前に０が押されている場合）
            this.display += value; // 0-と表示
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
         const firstIsNegative = /^-\d*\.?\d*$/.test(this.display); // 最初が-の場合


        // 3つ以上演算子は連続で入力できない
        if (valueIsOperator && lastTwoAreOperators) {
           return;
        }

        // 初期値マイナスは演算子に置き換えさせない
        if (['-+', '-×', '-÷'].includes(combo) && firstIsNegative) {
           return;
        }

        switch (combo) {
        case '++':
        case '--':
        case '××':
        case '÷÷':
        // 同じ演算子が連続 → 無視
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
        // 何にも当てはまらなかったら無視（予防線）
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
    }

    // 計算
    evaluate(): void {

      // 空欄なら何もしない
      if (this.display === '0') {
         return;
      }
      // 表示されているのが数字のみなら何もしない
      if (/^\d+(\.\d+)?$/.test(this.display)) {
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
         this.display === '100億以上の計算結果は表示できません' ||
         this.display === '-100億以下の計算結果は表示できません' ||
         this.display === 'Error'
       ) {
         return;
      }

      // 「0/0」または「0/-0」または0で割る部分が含まれるかチェック（どこにあっても）
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
            const rounded = Math.round(result * 1e8) / 1e8; // 小数点第9位で四捨五入した結果

            if (result >= 10000000000) {
              this.display = '100億以上の計算結果は表示できません';
            } else if (result <= -10000000000) {
              this.display = '-100億以下の計算結果は表示できません';
            }
            else if (Number.isInteger(result)) {
                  this.display = result.toString();  // 整数の場合はそのまま表示
            } else { // 小数の場合
                if (Math.abs(rounded) < 1e-6) { // 計算結果が1e-6より小さい場合、指数表示の防止（1e-7以下は指数表示になるため）
                  this.display = result.toFixed(8).replace(/\.?0+$/, '');
                } else {
                  this.display = parseFloat(result.toFixed(8)).toString();
                }
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
      // 計算結果が表示されている場合は何もしない
      if (this.resultDisplayed) {
        if (
          this.display === '0で割ることはできません' ||
          this.display === '結果が定義されていません' ||
          this.display === '100億以上の計算結果は表示できません' ||
          this.display === '-100億以下の計算結果は表示できません' ||
          this.display === 'Error'
        ) {
          this.display = '0';
          this.prevIsOperator = false;
          this.resultDisplayed = false;
          this.displayIsEmpty = true;
          return;
        }
          return;
      } else {
        const beforeDelete = this.display; // 削除前の表示
        this.display = this.display.slice(0, -1); // 計算式入力中は1文字ずつ消す
    
        // 計算結果が保存されていて、計算結果が表示されていない場合=演算子入力→削除したとき
        if (this.lastResult !== '' && !this.resultDisplayed) {
          const addedPart = beforeDelete.slice(this.lastResult.length); // 削除前の表示のうち、計算結果が保存されている部分を取り出す
          const isSingleOperator = /^[+\-×÷]$/.test(addedPart); // 取り出した部分が演算子かどうか
          const isBackToResult = this.display === this.lastResult; // 計算結果が表示されているかどうか
    
          if (isSingleOperator && isBackToResult) { // 演算子1つだけが追加された状態なら、計算結果に戻ったとみなして resultDisplayed を true に戻す
            this.resultDisplayed = true; // 計算結果は消せなくなる
          }
        }
      }
      if (this.display.length === 0) {
        this.display = '0'; // 最後の1文字を消した後は0を表示
        this.displayIsEmpty = true;
      }    
         // 演算子の状態を更新
        this.prevIsOperator = this.isOperator(this.display.slice(-1));
    }

    // 直前の数値を削除（CE）
    clearEntry(): void {
      // 直近が演算子2つ（例: 1*-）の場合は何もしない
      if (this.display.match(/[\+\-\×\÷]{2}$/)) {
          return;
       }
      // 最後の演算子を取得
      const operatorIndex = this.display.search(/[\+\-\×\÷](?=[^+\-\×\÷]*$)/); 
      
      // 演算子がある場合
      if (operatorIndex !== -1) {
        // 最初が-で、他に演算子が含まれていない場合は全部削除
        if (this.display.startsWith('-') && (!/[+\-\×\÷]/.test(this.display.slice(1)))) {
          this.display = '0';
          this.prevIsOperator = false;
          this.resultDisplayed = false;
          this.displayIsEmpty = true;
          return;
        }
        const prevChar = this.display[operatorIndex - 1];// 演算子の直前の文字を確認（直前の数値が負の数か確認）
          if (prevChar && /[\+\-\×\÷]/.test(prevChar)) { // 直前が演算子の場合その演算子と数値を消す（1×-2→-2が消される）
          this.display = this.display.slice(0, operatorIndex - 1 + 1);
        } else {
          this.display = this.display.slice(0, operatorIndex + 1); 
        }
      } else { // 演算子がない場合（＝数字のみの場合）全削除
         this.display = '0';
         this.prevIsOperator = false;
         this.resultDisplayed = false;
         this.displayIsEmpty = true;
         return;
      }
      if (this.resultDisplayed) { // 計算結果が表示されている時は全削除
        this.display = '0';
        this.prevIsOperator = false;
        this.resultDisplayed = false;
        this.displayIsEmpty = true;
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
        this.displayIsEmpty = true;
    }

    // カンマ付きの表示
   displayWithCommas(): string {
      // エラー文言のときはそのまま
      if (
        this.display === '0で割ることはできません' ||
        this.display === '結果が定義されていません' ||
        this.display === '100億以上の計算結果は表示できません' ||
        this.display === '-100億以下の計算結果は表示できません' ||
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

     