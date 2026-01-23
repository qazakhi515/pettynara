/*Shunday function tuzing, u parametrdagi array ichida eng ko'p
takrorlangan raqamni topib qaytarsin.

MASALAN: majorityElement([1,4,5,7,2,5,7,3,6,5,1])*/
function majorityElement(re: number[]): number {
  const count: Record<number, number> = {};
  let max = 0;
  let res = re[0]; // yoki 0

  for (const num of re) {
    count[num] = (count[num] ?? 0) + 1;

    if (count[num] > max) {
      max = count[num];
      res = num;
    }
  }

  return res;
}
console.log(majorityElement([1,4,5,7,2,5,7,3,6,5,1]));




/* loyihamiz standartlari haqida yozib olamiz 

-Logging standarts;
-Naming standarts;
  function, method, variable => Camel case;       goHome
  class lar => Paskal case;                       MemberService
  folderlar da => Kebab case;                     
  CSS => Snake case;                              button_style
-Error handlings
*/

// Shunday function tuzing, unga string argument pass bolsin. Function ushbu agrumentdagi digitlarni yangi stringda return qilsin
// MASALAN: getDigits("m14i1t") return qiladi "141"

// function getDigit(num:string):string {
// return num
// .split ("")
// .filter(a => a >= "0" && a <= "9")
// .join("");
// }
// console.log(getDigit("BRR 111"));

// console.log(getDigit("ihl1n23m34"));


/*shunday function tuzing, u integerlardan iborat arrayni argument sifatida qabul qilib, faqat positive qiymatlarni olib string holatda return qilsin
MASALAN: getPositive([1, -4, 2]) return qiladi "12"*/
//  let toplam: number[] = [1, 11, -2, 18, -11, 9];
// function getPositive (n: number[]):string[] {
//      return n.filter(n => n > 0).map(String);
// }
//  console.log(getPositive(toplam));


/*TASK G:

Yagona parametrga ega function tuzing.
Va bu function parametr orqalik integer ma'lumot turlariga ega bo'lgan bir arrayni qabul qilsin.
Ushbu function bizga arrayning tarkibidagi birinchi eng katta qiymatning indeksini qaytarsin.

MASALAN: getHighestIndex([5, 21, 12, 21 ,8]); return qiladi 1 sonini
Yuqoridagi misolda, birinchi indeksda 21 joylashgan.
Va bu 21 soni arrayning tarkibidagi birinchi eng katta son hisobladi va bizga uning indeksi 1 qaytadi. */

// function getHighestIndex(myArray :
// number[]): number {
//   let max: number = myArray[0];
//   let maxIndex: number = 0;

//   for (let i:number = 1; i < myArray.length; i++)
// {
//     if (myArray[i] > max) {
//       max = myArray[i];
//       maxIndex = i;
//     }
//   }
//      return maxIndex;
// }

// console.log(getHighestIndex([1, 5, 4, 14, 32]));
// console.log(getHighestIndex([21,12,3,8,12]));