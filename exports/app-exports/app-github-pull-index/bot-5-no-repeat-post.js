// ==========================================
// Bot 5 – No Repeat Post Checker
// File: server/bots/bot-5-no-repeat-post.js
// ==========================================

const postHistory = [];

function addToHistory(post) {
  postHistory.push({
    content: post.content,
    timestamp: new Date(),
    platform: post.platform
  });
}

function checkForDuplicates(newPost) {
  console.log("🤖 Bot 5: Checking for duplicate posts...");

  for (const oldPost of postHistory) {
    const similarity = calculateSimilarity(
      newPost.content,
      oldPost.content
    );

    if (similarity > 0.85) {
      console.log(
        `⚠️ Similar post found! Similarity: ${(similarity * 100).toFixed(2)}%`
      );
      return { isDuplicate: true, similarity, oldPost };
    }
  }

  console.log("✅ No duplicates found - safe to post");
  return { isDuplicate: false };
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
  const costs = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;

    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];

        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue =
            Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }

        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }

    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

async function validatePost(post) {
  const check = checkForDuplicates(post);

  if (check.isDuplicate) {
    console.log(
      `❌ Post rejected - too similar to post from ${check.oldPost.timestamp}`
    );
    return false;
  }

  addToHistory(post);
  console.log("✅ Post approved - added to history");
  return true;
}

module.exports = {
  validatePost,
  checkForDuplicates,
  addToHistory
};
