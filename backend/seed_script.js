import mongoose from 'mongoose';
import Problem from './models/problems.model.js';
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URL = process.env.MONGO_URL ;
const sampleProblems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p>You can return the answer in any order.</p>`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10⁴',
      '-10⁹ <= nums[i] <= 10⁹',
      '-10⁹ <= target <= 10⁹',
      'Only one valid answer exists.',
    ],
    boilerplate_code: {
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n}',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};'
    },
    driver_code: {
      python: `
import sys
import json

# [USER_CODE_WILL_BE_INSERTED_HERE]

def run_test():
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        
        nums = data["nums"]
        target = data["target"]
        
        result = twoSum(nums, target)
        
        print(json.dumps(result, separators=(',', ':')))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_test()
`,
      javascript: `
// [USER_CODE_WILL_BE_INSERTED_HERE]

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input_json = '';

process.stdin.on('data', function (chunk) {
    input_json += chunk;
});

process.stdin.on('end', function () {
    try {
        const data = JSON.parse(input_json);
        const nums = data.nums;
        const target = data.target;
        
        let result = twoSum(nums, target);
        
        console.log(JSON.stringify(result));
        
    } catch (e) {
        console.error(e);
    }
});
`,
      java: `
import java.util.Scanner;
import java.util.Arrays;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

// [USER_CODE_WILL_BE_INSERTED_HERE]

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder inputJson = new StringBuilder();
        while(sc.hasNextLine()) {
            inputJson.append(sc.nextLine());
        }
        
        try {
            Gson gson = new Gson();
            JsonObject data = gson.fromJson(inputJson.toString(), JsonObject.class);
            
            int[] nums = gson.fromJson(data.get("nums"), int[].class);
            int target = data.get("target").getAsInt();
            
            Solution solution = new Solution();
            int[] result = solution.twoSum(nums, target);
            
            System.out.println(gson.toJson(result));
            
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        
        sc.close();
    }
}
`,
      cpp: String.raw`
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

vector<int> parseIntArray(const string& str) {
    vector<int> result;
    string temp;
    bool inArray = false;
    
    for (char c : str) {
        if (c == '[') {
            inArray = true;
        } else if (c == ']') {
            if (!temp.empty()) {
                result.push_back(stoi(temp));
                temp.clear();
            }
            break;
        } else if (c == ',' && inArray) {
            if (!temp.empty()) {
                result.push_back(stoi(temp));
                temp.clear();
            }
        } else if (isdigit(c) || c == '-') {
            temp += c;
        }
    }
    return result;
}

int parseTarget(const string& str) {
    size_t pos = str.find("target");
    if (pos == string::npos) return 0;
    
    pos = str.find(':', pos);
    string temp;
    for (size_t i = pos + 1; i < str.length(); i++) {
        if (isdigit(str[i]) || str[i] == '-') {
            temp += str[i];
        } else if (!temp.empty()) {
            break;
        }
    }
    return temp.empty() ? 0 : stoi(temp);
}

string vectorToJson(const vector<int>& vec) {
    string result = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        result += to_string(vec[i]);
        if (i < vec.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

// [USER_CODE_WILL_BE_INSERTED_HERE]

int main() {
    string line;
    string input_json_str;
    while (getline(cin, line)) {
        input_json_str += line;
    }
    
    try {
        size_t numsPos = input_json_str.find("nums");
        size_t arrayStart = input_json_str.find('[', numsPos);
        size_t arrayEnd = input_json_str.find(']', arrayStart);
        string numsStr = input_json_str.substr(arrayStart, arrayEnd - arrayStart + 1);
        vector<int> nums = parseIntArray(numsStr);
        
        int target = parseTarget(input_json_str);
        
        Solution s;
        vector<int> result = s.twoSum(nums, target);
        
        cout << vectorToJson(result) << endl;
        
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
    }
    
    return 0;
}
`
    },
    testcase: [
      {
        input: '{"nums": [2,7,11,15], "target": 9}',
        expected_output: '[0,1]',
      },
      {
        input: '{"nums": [3,2,4], "target": 6}',
        expected_output: '[1,2]',
      },
    ],
    hidden_testcases: [
      {
        input: '{"nums": [2,7,11,15], "target": 9}',
        expected_output: '[0,1]',
      },
      {
        input: '{"nums": [3,2,4], "target": 6}',
        expected_output: '[1,2]',
      },
      {
        input: '{"nums": [3,3], "target": 6}',
        expected_output: '[0,1]',
      },
    ],
  },
  {
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `<p>A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.</p>
<p>Given a string <code>s</code>, return <code>true</code> <em>if it is a <strong>palindrome</strong>, or</em> <code>false</code> <em>otherwise</em>.</p>`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: 'After processing, the string is "amanaplanacanalpanama", which is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: 'After processing, the string is "raceacar", which is not a palindrome.',
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 'After removing non-alphanumeric characters, s is an empty string "". Since an empty string reads the same forward and backward, it is a palindrome.',
      },
    ],
    constraints: [
      '1 <= s.length <= 2 * 10⁵',
      's consists only of printable ASCII characters.',
    ],
    boilerplate_code: {
      python: 'def isPalindrome(s):\n    # Write your code here\n    pass',
      javascript:
        'function isPalindrome(s) {\n    // Write your code here\n};',
      java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your code here\n    }\n}',
      cpp: '#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n    }\n};',
    },
    driver_code: {
      python: `
import sys
import json

# [USER_CODE_WILL_BE_INSERTED_HERE]

def run_test():
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        
        s = data["s"]
        
        result = isPalindrome(s)
        
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_test()
`,
      javascript: `
// [USER_CODE_WILL_BE_INSERTED_HERE]

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input_json = '';

process.stdin.on('data', function (chunk) {
    input_json += chunk;
});

process.stdin.on('end', function () {
    try {
        const data = JSON.parse(input_json);
        const s = data.s;
        
        let result = isPalindrome(s);
        
        console.log(JSON.stringify(result));
        
    } catch (e) {
        console.error(e);
    }
});
`,
      java: `
import java.util.Scanner;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

// [USER_CODE_WILL_BE_INSERTED_HERE]

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder inputJson = new StringBuilder();
        while(sc.hasNextLine()) {
            inputJson.append(sc.nextLine());
        }
        
        try {
            Gson gson = new Gson();
            JsonObject data = gson.fromJson(inputJson.toString(), JsonObject.class);
            
            String s = data.get("s").getAsString();
            
            Solution solution = new Solution();
            boolean result = solution.isPalindrome(s);
            
            System.out.println(gson.toJson(result));
            
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        
        sc.close();
    }
}
`,
      cpp: String.raw`
#include <iostream>
#include <string>
using namespace std;

string parseStringValue(const string& json_str) {
    size_t sPos = json_str.find("\"s\"");
    if (sPos == string::npos) return "";
    
    size_t colonPos = json_str.find(':', sPos);
    if (colonPos == string::npos) return "";
    
    size_t firstQuote = json_str.find('"', colonPos);
    if (firstQuote == string::npos) return "";
    
    size_t secondQuote = json_str.find('"', firstQuote + 1);
    if (secondQuote == string::npos) return "";
    
    return json_str.substr(firstQuote + 1, secondQuote - firstQuote - 1);
}

// [USER_CODE_WILL_BE_INSERTED_HERE]

int main() {
    string line;
    string input_json_str;
    while (getline(cin, line)) {
        input_json_str += line;
    }
    
    string s_input = parseStringValue(input_json_str);
    
    Solution s;
    bool result = s.isPalindrome(s_input);
    
    cout << (result ? "true" : "false") << endl;
    
    return 0;
}
`,
    },
    testcase: [
      {
        input: '{"s": "A man, a plan, a canal: Panama"}',
        expected_output: 'true',
      },
      {
        input: '{"s": "race a car"}',
        expected_output: 'false',
      },
    ],
    hidden_testcases: [
      {
        input: '{"s": "A man, a plan, a canal: Panama"}',
        expected_output: 'true',
      },
      {
        input: '{"s": "race a car"}',
        expected_output: 'false',
      },
      {
        input: '{"s": " "}',
        expected_output: 'true',
      },
      {
        input: '{"s": "0P"}',
        expected_output: 'false',
      },
    ],
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: `<p>Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list's head</em>.</p>`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'The list is reversed as shown.',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
      },
      {
        input: 'head = []',
        output: '[]',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    boilerplate_code: {
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head):
        # Write your code here
        pass`,
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Write your code here
};`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
    }
};`,
    },
    driver_code: {
      python: `
import sys
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def create_linked_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def linked_list_to_array(head):
    arr = []
    current = head
    while current:
        arr.append(current.val)
        current = current.next
    return arr

# [USER_CODE_WILL_BE_INSERTED_HERE]

def run_test():
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        
        head_arr = data["head"]
        head = create_linked_list(head_arr)
        
        s = Solution()
        result_head = s.reverseList(head)
        
        result_arr = linked_list_to_array(result_head)
        
        print(json.dumps(result_arr, separators=(',', ':')))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_test()
`,
      javascript: `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

function createLinkedList(arr) {
    if (!arr || arr.length === 0) {
        return null;
    }
    let head = new ListNode(arr[0]);
    let current = head;
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    return head;
}

function linkedListToArray(head) {
    let arr = [];
    let current = head;
    while (current) {
        arr.push(current.val);
        current = current.next;
    }
    return arr;
}

// [USER_CODE_WILL_BE_INSERTED_HERE]

process.stdin.resume();
process.stdin.setEncoding('utf8');
let input_json = '';
process.stdin.on('data', function (chunk) { input_json += chunk; });

process.stdin.on('end', function () {
    try {
        const data = JSON.parse(input_json);
        const head_arr = data.head;
        const head = createLinkedList(head_arr);
        
        let result_head = reverseList(head);
        
        let result_arr = linkedListToArray(result_head);
        
        console.log(JSON.stringify(result_arr));
        
    } catch (e) {
        console.error(e);
    }
});
`,
      java: `
import java.util.Scanner;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// [USER_CODE_WILL_BE_INSERTED_HERE]

public class Main {
    
    public static ListNode createLinkedList(List<Integer> arr) {
        if (arr == null || arr.isEmpty()) {
            return null;
        }
        ListNode head = new ListNode(arr.get(0));
        ListNode current = head;
        for (int i = 1; i < arr.size(); i++) {
            current.next = new ListNode(arr.get(i));
            current = current.next;
        }
        return head;
    }
    
    public static List<Integer> linkedListToArray(ListNode head) {
        List<Integer> arr = new ArrayList<>();
        ListNode current = head;
        while (current != null) {
            arr.add(current.val);
            current = current.next;
        }
        return arr;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder inputJson = new StringBuilder();
        while(sc.hasNextLine()) {
            inputJson.append(sc.nextLine());
        }
        
        try {
            Gson gson = new Gson();
            JsonObject data = gson.fromJson(inputJson.toString(), JsonObject.class);
            
            Type listType = new TypeToken<ArrayList<Integer>>(){}.getType();
            List<Integer> head_arr = gson.fromJson(data.get("head"), listType);
            
            ListNode head = createLinkedList(head_arr);
            
            Solution solution = new Solution();
            ListNode result_head = solution.reverseList(head);
            
            List<Integer> result_arr = linkedListToArray(result_head);
            
            System.out.println(gson.toJson(result_arr));
            
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        
        sc.close();
    }
}
`,
      cpp: String.raw`
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

vector<int> parseIntArray(const string& str) {
    vector<int> result;
    string temp;
    bool inArray = false;
    
    for (char c : str) {
        if (c == '[') {
            inArray = true;
        } else if (c == ']') {
            if (!temp.empty()) {
                result.push_back(stoi(temp));
                temp.clear();
            }
            break;
        } else if (c == ',' && inArray) {
            if (!temp.empty()) {
                result.push_back(stoi(temp));
                temp.clear();
            }
        } else if (isdigit(c) || c == '-') {
            temp += c;
        }
    }
    return result;
}

ListNode* createLinkedList(const vector<int>& arr) {
    if (arr.empty()) {
        return nullptr;
    }
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    for (size_t i = 1; i < arr.size(); ++i) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    return head;
}

string linkedListToJson(ListNode* head) {
    string result = "[";
    ListNode* current = head;
    bool first = true;
    while (current) {
        if (!first) result += ",";
        result += to_string(current->val);
        first = false;
        current = current->next;
    }
    result += "]";
    return result;
}

void deleteLinkedList(ListNode* head) {
    while(head) {
        ListNode* temp = head;
        head = head->next;
        delete temp;
    }
}

// [USER_CODE_WILL_BE_INSERTED_HERE]

int main() {
    string line;
    string input_json_str;
    while (getline(cin, line)) {
        input_json_str += line;
    }
    
    ListNode* head = nullptr;
    ListNode* result_head = nullptr;
    
    try {
        size_t headPos = input_json_str.find("head");
        size_t arrayStart = input_json_str.find('[', headPos);
        size_t arrayEnd = input_json_str.find(']', arrayStart);
        string headStr = input_json_str.substr(arrayStart, arrayEnd - arrayStart + 1);
        vector<int> head_arr = parseIntArray(headStr);
        
        head = createLinkedList(head_arr);
        
        Solution s;
        result_head = s.reverseList(head);
        
        cout << linkedListToJson(result_head) << endl;
        
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
    }
    
    deleteLinkedList(result_head);
    
    return 0;
}
`
    },
    testcase: [
      {
        input: '{"head": [1,2,3,4,5]}',
        expected_output: '[5,4,3,2,1]',
      },
      {
        input: '{"head": [1,2]}',
        expected_output: '[2,1]',
      },
    ],
    hidden_testcases: [
      {
        input: '{"head": [1,2,3,4,5]}',
        expected_output: '[5,4,3,2,1]',
      },
      {
        input: '{"head": [1,2]}',
        expected_output: '[2,1]',
      },
      {
        input: '{"head": []}',
        expected_output: '[]',
      },
      {
        input: '{"head": [1]}',
        expected_output: '[1]',
      },
    ],
  },
  // ... add more problems here
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    const result = await Problem.insertMany(sampleProblems);
    console.log(`${result.length} problems seeded successfully!`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();