// TASK ZD

// Shunday function yozing. Bu function o'ziga, parametr sifatida
// birinchi oddiy number, keyin yagona array va uchinchi bo'lib oddiy number
// qabul qilsin. Berilgan birinchi number parametr, arrayning tarkibida indeks bo'yicha hisoblanib,
// shu aniqlangan indeksni uchinchi number parametr bilan alashtirib, natija sifatida
// yangilangan arrayni qaytarsin.

// MASALAN: changeNumberInArray(1, [1,3,7,2], 2) return [1,2,7,2];

// Yuqoridagi misolda, birinchi raqam bu '1' va arrayning '1'chi indeksi bu 3.
// Bizning function uchinchi berilgan '2' raqamini shu '3' bilan almashtirib,
// yangilangan arrayni qaytarmoqda.

function changeNumberInArray(
  index: number,
  arr: number[],
  newNumber: number,
): number[] {
  arr[index] = newNumber;
  return arr;
}

console.log(changeNumberInArray(1, [1, 3, 7, 2], 2));

// function randomBetween(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// console.log(randomBetween(40, 60));

// function findIntersection(arr1: number[], arr2: number[]): number[] {
//   const oxshash = new Set(arr2);
//   const result = arr1.filter((value) => oxshash.has(value));
//   return [...new Set(result)];
// }

// console.log(findIntersection([1, 2, 3], [3, 2, 0])); // [2, 3]

// function countOccurrences(obj: unknown, key: string): number {
//   if (obj === null || typeof obj !== "object") return 0;

//   return Object.entries(obj as Record<string, unknown>).reduce(
//     (acc, [k, value]) =>
//       acc + (k === key ? 1 : 0) + countOccurrences(value, key),
//     0,
//   );
// }

// const result = countOccurrences(
//   { model: "Bugatti", steer: { model: "HANKOOK", size: 30 } },
//   "model",
// );

// console.log("model:", result); // 2
// // TASK W

// Shunday function yozing, u o'ziga parametr sifatida
// yagona array va number qabul qilsin. Siz tuzgan function
// arrayni numberda berilgan uzunlikda kesib bo'laklarga
// ajratgan holatida qaytarsin.

// function bolakArray<T>(arr: T[], size: number): T[][] {
//   const result: T[][] = [];

//   for (let i = 0; i < arr.length; i += size) {
//     const bolak: T[] = arr.slice(i, i + size);
//     result.push(bolak);
//   }

//   return result;
// }

//console.log(bolakArray<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3));
// TASK V

// Shunday function yozing, uni string parametri bo'lsin.
// Va bu function stringdagi har bir harfni o'zi bilan
// necha marotaba taktorlanganligini ko'rsatuvchi object qaytarsin.
// MASALAN: countChars("hello") return {h: 1, e: 1, l: 2, o: 1}
// Yuqoridagi misolda, 'hello' so'zi tarkibida
// qatnashgan harflar necha marotaba takrorlangini bilan
// object sifatida qaytarilmoqda.
// function countChars(str: string): Record<string, number> {
//   const result: Record<string, number> = {};

//   for (const char of str) {
//     if (result[char]) {
//       result[char]++;
//     } else {
//       result[char] = 1;
//     }
//   }

//   return result;
// }

// console.log(countChars("hello"));
// console.log(countChars("salom"));
// Natija: { h: 1, e: 1, l: 2, o: 1 }//shunday function tuzing uni number parametri bolsin. va bu parametrgacha 0dan boshlab oraliqda nechta toq son borligini aniqlab return qilsin
// function sumOdds(number: number): number {
//   let count: number = 0;

//   for (let i: number = 0; i < number; i++) {
//     if (i % 2 !== 0) {
//       count++;
//     }
//   }

//   return count;
// }

// // Misollar:
// console.log(sumOdds(9)); // 4
// console.log(sumOdds(10)); // 4

//Shunday function tuzing, u sonlardan tashkil topgan 2'ta array qabul qilsin.
// Va ikkala arraydagi sonlarni tartiblab bir arrayda qaytarsin.

// function mergeSortedArrays(arr1: number[], arr2: number[]): number[] {
//   const result: number[] = [];
//   let i: number = 0;
//   let j: number = 0;
//   while (i < arr1.length && j < arr2.length) {
//     if (arr1[i] <= arr2[j]) {
//       result.push(arr1[i]);
//       i++;
//     } else {
//       result.push(arr2[j]);
//       j++;
//     }
//   }
//   while (i < arr1.length) {
//     result.push(arr1[i]);
//     i++;
//   }
//   while (j < arr2.length) {
//     result.push(arr2[j]);
//     j++;
//   }
//   return result;
// }
// const merged = mergeSortedArrays([0, 3, 4], [4, 6, 11]);
// console.log(merged);
// Shunday function tuzing, u numberlardan tashkil topgan array qabul qilsin
// va o'sha numberlar orasidagi tushib qolgan sonni topib uni return qilsin.

// MASALAN: missingNumber([3, 0, 1]); return 2
// Yuqoridagi misolda, berilayotgan sonlar tarkibini tartiblasak
// '2' soni tushib qolgan
// const missingNum = (arr: number[]): number => {
//   const num = arr.length + 1;
//   const expectedSum = (num * (num + 1)) / 2;
//   const actualSum = arr.reduce((sum, num) => sum + num, 0);
//   return expectedSum - actualSum;
// };
// const numbers: number[] = [1, 2, 3, 5];
// const numbers1: number[] = [1, 2, 3, 4, 5, 7];

// const natija: number = missingNum(numbers);
// const natija1: number = missingNum(numbers1);

// console.log("natija:", natija);
// console.log("natija1:", natija1);

// TASK R

// Shunday function yozing, u string parametrga ega bo'lsin.
// Agar argument sifatida berilayotgan string, "1 + 2" bo'lsa,
// string ichidagi sonlarin yig'indisni hisoblab, number holatida qaytarsin

// MASALAN: calculate("1 + 3"); return 4;
// 1 + 3 = 4, shu sababli 4 natijani qaytarmoqda.
// function sumFromString(str: string): number {
//     const raqam: string[] = str.split("+");
//     let yigindi: number = 0;

//     for (let i = 0; i < raqam.length; i++) {
//         yigindi += Number(raqam[i].trim());
//     }

//     return yigindi;
// }

// console.log(sumFromString("1 + 2"));
// console.log(sumFromString("5 + 6 + 7"));

// Shunday function yozing, u 2 ta parametrga ega bo'lib
// birinchisi object, ikkinchisi string bo'lsin.
// Agar qabul qilinayotgan ikkinchi string, objectning
// biror bir propertysiga mos kelsa, 'true', aks holda mos kelmasa 'false' qaytarsin.

// function hasProperty(
//   obj: Record<string, unknown>,
//   prop: string
// ): boolean {
//   return prop in obj;
// }
//  const person = {
//   name: "Justin",
//   age: 30,
//   location: "Cheonju"
//  };
//  console.log(hasProperty(person,"name"));
//  console.log(hasProperty(person,"age"));
//  console.log(hasProperty(person,"main"));
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
