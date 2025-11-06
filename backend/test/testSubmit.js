import axios from 'axios';

// ============= TWO SUM TESTS =============
const testTwoSumPythonCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Two%20Sum',
      {
        language: 'python',
        code: `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Two Sum - Python Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Two Sum - Python Error:', error.response?.data || error.message);
  }
};

const testTwoSumCppCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Two%20Sum',
      {
        language: 'cpp',
        code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Two Sum - C++ Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Two Sum - C++ Error:', error.response?.data || error.message);
  }
};

// ============= VALID PALINDROME TESTS =============
const testValidPalindromePythonCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Valid%20Palindrome',
      {
        language: 'python',
        code: `def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Valid Palindrome - Python Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Valid Palindrome - Python Error:', error.response?.data || error.message);
  }
};

const testValidPalindromePythonWrong = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Valid%20Palindrome',
      {
        language: 'python',
        code: `def isPalindrome(s):
    return True  # Always returns true - wrong solution`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n❌ Valid Palindrome - Python Wrong:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Valid Palindrome - Python Error:', error.response?.data || error.message);
  }
};

const testValidPalindromeCppCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Valid%20Palindrome',
      {
        language: 'cpp',
        code: `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;
            if (tolower(s[left]) != tolower(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }
};`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Valid Palindrome - C++ Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Valid Palindrome - C++ Error:', error.response?.data || error.message);
  }
};

const testValidPalindromeJavaScriptCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Valid%20Palindrome',
      {
        language: 'javascript',
        code: `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Valid Palindrome - JavaScript Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Valid Palindrome - JavaScript Error:', error.response?.data || error.message);
  }
};

// ============= REVERSE LINKED LIST TESTS =============
const testReverseLinkedListPythonCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Reverse%20Linked%20List',
      {
        language: 'python',
        code: `class Solution:
    def reverseList(self, head):
        prev = None
        current = head
        while current:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        return prev`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Reverse Linked List - Python Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Reverse Linked List - Python Error:', error.response?.data || error.message);
  }
};

const testReverseLinkedListPythonWrong = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Reverse%20Linked%20List',
      {
        language: 'python',
        code: `class Solution:
    def reverseList(self, head):
        return head  # Wrong - doesn't reverse`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n❌ Reverse Linked List - Python Wrong:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Reverse Linked List - Python Error:', error.response?.data || error.message);
  }
};

const testReverseLinkedListCppCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Reverse%20Linked%20List',
      {
        language: 'cpp',
        code: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* current = head;
        while (current != nullptr) {
            ListNode* nextNode = current->next;
            current->next = prev;
            prev = current;
            current = nextNode;
        }
        return prev;
    }
};`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Reverse Linked List - C++ Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Reverse Linked List - C++ Error:', error.response?.data || error.message);
  }
};

const testReverseLinkedListJavaScriptCorrect = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/problems/submit/Reverse%20Linked%20List',
      {
        language: 'javascript',
        code: `function reverseList(head) {
    let prev = null;
    let current = head;
    while (current !== null) {
        let nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
    }
    return prev;
}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Reverse Linked List - JavaScript Correct:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Reverse Linked List - JavaScript Error:', error.response?.data || error.message);
  }
};

// Run all tests
(async () => {
  console.log('========== TESTING TWO SUM ==========');
  await testTwoSumPythonCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testTwoSumCppCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n========== TESTING VALID PALINDROME ==========');
  await testValidPalindromePythonCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testValidPalindromePythonWrong();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testValidPalindromeCppCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testValidPalindromeJavaScriptCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n========== TESTING REVERSE LINKED LIST ==========');
  await testReverseLinkedListPythonCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testReverseLinkedListPythonWrong();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testReverseLinkedListCppCorrect();
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testReverseLinkedListJavaScriptCorrect();
  
  console.log('\n========== ALL TESTS COMPLETED ==========');
})();