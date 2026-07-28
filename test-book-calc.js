const mems = [1, 2, 3]; // 3 memories
const pages = [];
pages.push({ front: 'cover', back: mems[0] });
for (let i = 1; i < mems.length; i += 2) {
  pages.push({
    front: mems[i],
    back: mems[i + 1] ? mems[i + 1] : 'blank'
  });
}
const lastPage = pages[pages.length - 1];
if (lastPage.back !== 'blank') {
  pages.push({ front: 'blank', back: 'back_cover' });
} else {
  lastPage.back = 'back_cover';
}
console.log(pages);
