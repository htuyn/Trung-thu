def backtrack(i, total):
    if total == K:
        ans.append(current[:])
        return

    if i == N or total > K:
        return

    current.append(A[i])
    backtrack(i + 1, total + A[i])
    current.pop()

    backtrack(i + 1, total)


T = int(input())

for _ in range(T):
    N, K = map(int, input().split())
    A = list(map(int, input().split()))

    A.sort()

    current = []
    ans = []

    backtrack(0, 0)

    if len(ans) == 0:
        print(-1)
    else:
        ans.sort()
        print(" ".join("[" + " ".join(map(str, x)) + "]" for x in ans))