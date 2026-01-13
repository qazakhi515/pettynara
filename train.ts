/*TASK G:

Yagona parametrga ega function tuzing.
Va bu function parametr orqalik integer ma'lumot turlariga ega bo'lgan bir arrayni qabul qilsin.
Ushbu function bizga arrayning tarkibidagi birinchi eng katta qiymatning indeksini qaytarsin.

MASALAN: getHighestIndex([5, 21, 12, 21 ,8]); return qiladi 1 sonini
Yuqoridagi misolda, birinchi indeksda 21 joylashgan.
Va bu 21 soni arrayning tarkibidagi birinchi eng katta son hisobladi va bizga uning indeksi 1 qaytadi. */

function getHighestIndex(myArray :
number[]): number {
  let max: number = myArray[0];
  let maxIndex: number = 0;

  for (let i:number = 1; i < myArray.length; i++)
{
    if (myArray[i] > max) {
      max = myArray[i];
      maxIndex = i;
    }
  }
     return maxIndex;
}

console.log(getHighestIndex([1, 5, 4, 14, 32]));
console.log(getHighestIndex([21,12,3,8,12]));