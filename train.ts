

// Shunday function yozing, u 2 ta parametrga ega bo'lib
// birinchisi object, ikkinchisi string bo'lsin.
// Agar qabul qilinayotgan ikkinchi string, objectning
// biror bir propertysiga mos kelsa, 'true', aks holda mos kelmasa 'false' qaytarsin.

function hasProperty(
  obj: Record<string, unknown>,
  prop: string
): boolean {
  return prop in obj;
}
 const person = {
  name: "Justin",
  age: 30,
  location: "Cheonju"
 };
 console.log(hasProperty(person,"name"));
 console.log(hasProperty(person,"age"));
 console.log(hasProperty(person,"main"));
// TASK P:

// Parametr sifatida yagona object qabul qiladigan function yozing.
// Qabul qilingan objectni nested array sifatida convert qilib qaytarsin

// MASALAN: objectToArray( {a: 10, b: 20}) return [['a', 10], ['b', 20]]

// function objectToArray(
//   obj: Record<string, any>
// ): [string, any][] {
//   return Object.entries(obj);
// }
// const result = objectToArray({ a: 10, b: 20 });
// console.log("result :",result)

// const result1 = objectToArray({ a: 24, b: 22 });
// console.log("result1:",result1)


// Shunday function yozing va u har xil qiymatlardan iborat array qabul qilsin. 
// Va array ichidagi sonlar yig'indisini hisoblab chiqgan javobni qaytarsin
//  MASALAN: calculateSumOfNumbers([10, "10", {son: 10}, true, 35]); return 45


// function calculateSumOfNumbers(arr: unknown[]): number {
//   return arr.reduce((sum: number, item: unknown): number => {
//     if (typeof item === "number") {
//       return sum + item;
//     }
//     return sum;
//   }, 0);
// }

// // Misol:
// calculateSumOfNumbers([10, "10", { son: 10 }, true, 35]);
// console.log(calculateSumOfNumbers([10, "10", { son: 10 }, true, 35]))
// N-TASK: 

// Shunday function yozing, u string qabul qilsin va string palindrom yani togri oqilganda ham, orqasidan oqilganda ham bir hil oqiladigan soz ekanligini aniqlab boolean qiymat qaytarsin.
// MASALAN: palindromCheck("dad") return true;  palindromCheck("son") return false;

// function palindrome(polindr: string): boolean {
//   for (let i = 0; i < polindr.length / 2; i++) {
//     if (polindr[i] !== polindr[polindr.length - 1 - i]) {
//       return false;
//     }
//   }
//   return true;
// }

// // Misollar
// console.log(palindrome("dad")); 
// console.log(palindrome("son")); 
// console.log(palindrome("kiyik")); 

// TASK M:

// Shunday function tuzing, u raqamlardan tashkil topgan array qabul qilsin
// va array ichidagi har bir raqam uchun raqamning o'zi va hamda o'sha raqamni kvadratidan
// tashkil topgan object hosil qilib, hosil bo'lgan objectlarni array ichida qaytarsin

// function kvadrat(numbers: number[]) {
//   return numbers.map((n) => {
//     return {
//       value: n,
//       square: n * n
//     };
//   });
// }
// const result = kvadrat([2, 4, 7, 8]);
// console.log(result);
// const natija = kvadrat([10, 11, 20]);
// console.log("KOPAYTMA :",natija);

// TASK L:
// So'zlarni ketma - ketligini buzmasdan har bir so'zni
// alohida teskarisiga o'girib beradigan fucntion tuzing.
// Funtion yagona string qabul qilsin

// MASALAN: reverseSentence("we like coding!") return "ew ekil !gnidoc";
// Qaytayotgan natijaga e'tibor bersangiz, so'zlar joyi o'zgarmasdan turgan o'rnida teskarisiga o'girilmoqda
//  function reverseEach(soz: string):
//  string{
//    return soz
//    .split(' ')
//    .map((alfabit: string) =>
//   alfabit.split('').reverse().join('') )
//    .join(' ');
//  }
//  const natija = reverseEach('Salom MIT azolari');
//  console.log('Salom MIT azolari:  ', natija);


// TASK K:

// Berilayotgan parametr tarkibida nechta unli harf bor
// ekanligini aniqlovchi function tuzing

// MASALAN: countVowels("string"); return 1

// Yuqoridagi misolda 'string' so'zi tarkibida yagona unli harf 'i'
// bo'lganligi uchun '1'ni qaytarmoqda

// function unliHarf(lyuboy: string): number {
//   return lyuboy
//     .split('')
//     .filter(harf => 'aeiou'.includes(harf))
//     .length;
// }

// console.log("salom =", unliHarf("salom"));
// console.log("uzbekistan =", unliHarf("uzbekistan"));

// TASK J:

// Shunday function tuzing, u string qabul qilsin.
// Va string ichidagi eng uzun so'zni qaytarsin.

// function findLongestWord(str: string): string {
//   const words: string[] = str.split(" ");
//   let longest: string = "";

//   for (const word of words) {
//     if (word.length > longest.length) {
//       longest = word;
//     }
//   }

//   return longest;
// }

//  Misol:
// console.log(findLongestWord("I am uzbek living in SouthKorea!"));



/*Shunday function tuzing, u parametrdagi array ichida eng ko'p
takrorlangan raqamni topib qaytarsin.

MASALAN: majorityElement([1,4,5,7,2,5,7,3,6,5,1])*/
// function majorityElement(re: number[]): number {
//   const count: Record<number, number> = {};
//   let max = 0;
//   let res = re[0]; // yoki 0

//   for (const num of re) {
//     count[num] = (count[num] ?? 0) + 1;

//     if (count[num] > max) {
//       max = count[num];
//       res = num;
//     }
//   }

//   return res;
// }
// console.log(majorityElement([1,4,5,7,2,5,7,3,6,5,1]));




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