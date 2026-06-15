// The algorithm x language content matrix.
//
// Snippet rules: one focused algorithm per snippet, ~8-20 lines, 4-space
// indentation, no blank lines, no trailing whitespace, straight ASCII quotes.
//
// The data is structured so adding a language (Go, TypeScript, C#, ...) or a
// new algorithm is a matter of extending these arrays.

export type LanguageId = 'python' | 'javascript' | 'java' | 'cpp'

export interface Language {
  id: LanguageId
  name: string
  ext: string
  /** How a snippet filename is cased for this language. */
  case: 'snake' | 'camel' | 'pascal'
  /** Which tokenizer dialect to use for syntax highlighting. */
  tokLang: 'python' | 'javascript' | 'java' | 'cpp'
}

export const LANGUAGES: Language[] = [
  { id: 'python', name: 'Python', ext: 'py', case: 'snake', tokLang: 'python' },
  { id: 'javascript', name: 'JavaScript', ext: 'js', case: 'camel', tokLang: 'javascript' },
  { id: 'java', name: 'Java', ext: 'java', case: 'pascal', tokLang: 'java' },
  { id: 'cpp', name: 'C++', ext: 'cpp', case: 'snake', tokLang: 'cpp' },
]

export interface Algorithm {
  id: string
  name: string
  /** Longer snippets sit behind the "advanced" filter. */
  advanced: boolean
  impls: Record<LanguageId, string>
}

export const ALGORITHMS: Algorithm[] = [
  {
    id: 'binary-search',
    name: 'Binary Search',
    advanced: false,
    impls: {
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      javascript: `function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
      java: `int binarySearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
      cpp: `int binary_search(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
    },
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    advanced: false,
    impls: {
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      javascript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}`,
      java: `int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      cpp: `int linear_search(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
    },
  },
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    advanced: false,
    impls: {
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
      java: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      cpp: `void bubble_sort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    },
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    advanced: false,
    impls: {
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
      java: `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      cpp: `void insertion_sort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    },
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    advanced: false,
    impls: {
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr`,
      javascript: `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
    return arr;
}`,
      java: `void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}`,
      cpp: `void selection_sort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        int min_index = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_index]) {
                min_index = j;
            }
        }
        swap(arr[i], arr[min_index]);
    }
}`,
    },
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    advanced: false,
    impls: {
      python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
      javascript: `function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
      java: `List<Integer> quickSort(List<Integer> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    int pivot = arr.get(arr.size() / 2);
    List<Integer> left = new ArrayList<>();
    List<Integer> middle = new ArrayList<>();
    List<Integer> right = new ArrayList<>();
    for (int x : arr) {
        if (x < pivot) left.add(x);
        else if (x == pivot) middle.add(x);
        else right.add(x);
    }
    List<Integer> result = new ArrayList<>(quickSort(left));
    result.addAll(middle);
    result.addAll(quickSort(right));
    return result;
}`,
      cpp: `vector<int> quick_sort(vector<int> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    int pivot = arr[arr.size() / 2];
    vector<int> left, middle, right;
    for (int x : arr) {
        if (x < pivot) left.push_back(x);
        else if (x == pivot) middle.push_back(x);
        else right.push_back(x);
    }
    vector<int> result = quick_sort(left);
    result.insert(result.end(), middle.begin(), middle.end());
    vector<int> high = quick_sort(right);
    result.insert(result.end(), high.begin(), high.end());
    return result;
}`,
    },
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    advanced: false,
    impls: {
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      javascript: `function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      java: `List<Integer> mergeSort(List<Integer> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    int mid = arr.size() / 2;
    List<Integer> left = mergeSort(arr.subList(0, mid));
    List<Integer> right = mergeSort(arr.subList(mid, arr.size()));
    List<Integer> result = new ArrayList<>();
    int i = 0;
    int j = 0;
    while (i < left.size() && j < right.size()) {
        if (left.get(i) <= right.get(j)) {
            result.add(left.get(i++));
        } else {
            result.add(right.get(j++));
        }
    }
    while (i < left.size()) result.add(left.get(i++));
    while (j < right.size()) result.add(right.get(j++));
    return result;
}`,
      cpp: `vector<int> merge_sort(vector<int> arr) {
    if (arr.size() <= 1) {
        return arr;
    }
    int mid = arr.size() / 2;
    vector<int> left(arr.begin(), arr.begin() + mid);
    vector<int> right(arr.begin() + mid, arr.end());
    left = merge_sort(left);
    right = merge_sort(right);
    vector<int> result;
    int i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i++]);
        } else {
            result.push_back(right[j++]);
        }
    }
    while (i < left.size()) result.push_back(left[i++]);
    while (j < right.size()) result.push_back(right[j++]);
    return result;
}`,
    },
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    advanced: true,
    impls: {
      python: `import heapq
def heap_sort(arr):
    heap = list(arr)
    heapq.heapify(heap)
    result = []
    while heap:
        result.append(heapq.heappop(heap))
    return result`,
      javascript: `function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}
function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}`,
      java: `void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}
void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
      cpp: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}
void heap_sort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
    },
  },
  {
    id: 'bfs',
    name: 'BFS',
    advanced: true,
    impls: {
      python: `from collections import deque
def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
      javascript: `function bfs(graph, start) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    while (queue.length > 0) {
        const node = queue.shift();
        order.push(node);
        for (const neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return order;
}`,
      java: `List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    List<Integer> order = new ArrayList<>();
    visited.add(start);
    queue.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order.add(node);
        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.add(neighbor);
            }
        }
    }
    return order;
}`,
      cpp: `vector<int> bfs(map<int, vector<int>>& graph, int start) {
    set<int> visited;
    queue<int> q;
    vector<int> order;
    visited.insert(start);
    q.push(start);
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        order.push_back(node);
        for (int neighbor : graph[node]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}`,
    },
  },
  {
    id: 'dfs',
    name: 'DFS',
    advanced: true,
    impls: {
      python: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    order = [node]
    for neighbor in graph[node]:
        if neighbor not in visited:
            order.extend(dfs(graph, neighbor, visited))
    return order`,
      javascript: `function dfs(graph, start) {
    const visited = new Set();
    const stack = [start];
    const order = [];
    while (stack.length > 0) {
        const node = stack.pop();
        if (!visited.has(node)) {
            visited.add(node);
            order.push(node);
            for (const neighbor of graph[node]) {
                stack.push(neighbor);
            }
        }
    }
    return order;
}`,
      java: `List<Integer> dfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Deque<Integer> stack = new ArrayDeque<>();
    List<Integer> order = new ArrayList<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int node = stack.pop();
        if (!visited.contains(node)) {
            visited.add(node);
            order.add(node);
            for (int neighbor : graph.get(node)) {
                stack.push(neighbor);
            }
        }
    }
    return order;
}`,
      cpp: `vector<int> dfs(map<int, vector<int>>& graph, int start) {
    set<int> visited;
    stack<int> st;
    vector<int> order;
    st.push(start);
    while (!st.empty()) {
        int node = st.top();
        st.pop();
        if (visited.find(node) == visited.end()) {
            visited.insert(node);
            order.push_back(node);
            for (int neighbor : graph[node]) {
                st.push(neighbor);
            }
        }
    }
    return order;
}`,
    },
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    advanced: true,
    impls: {
      python: `import heapq
def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for neighbor, weight in graph[node]:
            if d + weight < dist[neighbor]:
                dist[neighbor] = d + weight
                heapq.heappush(heap, (dist[neighbor], neighbor))
    return dist`,
      javascript: `function dijkstra(graph, start) {
    const dist = {};
    for (const node in graph) {
        dist[node] = Infinity;
    }
    dist[start] = 0;
    const pq = [[0, start]];
    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, node] = pq.shift();
        if (d > dist[node]) continue;
        for (const [neighbor, weight] of graph[node]) {
            if (d + weight < dist[neighbor]) {
                dist[neighbor] = d + weight;
                pq.push([dist[neighbor], neighbor]);
            }
        }
    }
    return dist;
}`,
      java: `Map<Integer, Integer> dijkstra(Map<Integer, List<int[]>> graph, int start) {
    Map<Integer, Integer> dist = new HashMap<>();
    for (int node : graph.keySet()) {
        dist.put(node, Integer.MAX_VALUE);
    }
    dist.put(start, 0);
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.add(new int[]{0, start});
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], node = top[1];
        if (d > dist.get(node)) continue;
        for (int[] edge : graph.get(node)) {
            if (d + edge[1] < dist.get(edge[0])) {
                dist.put(edge[0], d + edge[1]);
                pq.add(new int[]{dist.get(edge[0]), edge[0]});
            }
        }
    }
    return dist;
}`,
      cpp: `map<int, int> dijkstra(map<int, vector<pair<int, int>>>& graph, int start) {
    map<int, int> dist;
    for (auto& entry : graph) {
        dist[entry.first] = INT_MAX;
    }
    dist[start] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, node] = pq.top();
        pq.pop();
        if (d > dist[node]) continue;
        for (auto& edge : graph[node]) {
            if (d + edge.second < dist[edge.first]) {
                dist[edge.first] = d + edge.second;
                pq.push({dist[edge.first], edge.first});
            }
        }
    }
    return dist;
}`,
    },
  },
]

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function words(name: string): string[] {
  return name.trim().split(/\s+/)
}

export function filenameFor(algo: Algorithm, lang: Language): string {
  const w = words(algo.name)
  let base: string
  if (lang.case === 'snake') {
    base = w.map((s) => s.toLowerCase()).join('_')
  } else if (lang.case === 'camel') {
    base = w.map((s, i) => (i === 0 ? s.toLowerCase() : capitalize(s.toLowerCase()))).join('')
  } else {
    base = w.map((s) => capitalize(s.toLowerCase())).join('')
  }
  return `${base}.${lang.ext}`
}

export function getAlgorithm(id: string): Algorithm {
  return ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[0]
}

export function getLanguage(id: LanguageId): Language {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0]
}
