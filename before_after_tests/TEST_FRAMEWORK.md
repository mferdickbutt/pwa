# Test Framework Template

Use this template for running before/after tests on Claude Code improvements.

## Test Setup

### Prerequisites
1. Fresh Claude Code session
2. Clean git state (no uncommitted changes)
3. All improvements implemented

### Test Process

#### BEFORE Test (Baseline)
1. Start a fresh Claude Code session WITHOUT the improvement enabled
2. Record the exact prompt
3. Observe Claude's response:
   - Which files did it read?
   - What tools did it use?
   - What code did it generate?
   - How long did it take?
   - Was the output correct?
   - Did it follow project patterns?
   - Were there any errors or issues?
4. Save observations to `TEST_NAME_BEFORE.md`

#### Apply Improvement
1. Enable the improvement (add skill, agent, command, or hook)
2. Restart Claude Code session

#### AFTER Test
1. Use the SAME exact prompt from BEFORE
2. Observe Claude's response:
   - Which files did it read? (compare to BEFORE)
   - What tools did it use? (compare to BEFORE)
   - What code did it generate? (compare to BEFORE)
   - How long did it take? (compare to BEFORE)
   - Was the output correct? (compare to BEFORE)
   - Did it follow project patterns? (compare to BEFORE)
   - Were there any errors or issues? (compare to BEFORE)
3. Save observations to `TEST_NAME_AFTER.md`

#### Analysis
1. Compare BEFORE and AFTER results
2. Identify differences
3. Assess impact:
   - Did the improvement help?
   - How much better was the AFTER result?
   - Was it worth the effort?
   - Would you recommend this improvement?
4. Save analysis to `TEST_NAME_ANALYSIS.md`

## Test Template

### Test Name: [NAME]

#### Description
[Brief description of what this test evaluates]

#### Prompt
```
[Exact prompt to use for both BEFORE and AFTER]
```

#### Expected BEFORE Behavior
[What you expect Claude to do WITHOUT the improvement]

#### Expected AFTER Behavior
[What you expect Claude to do WITH the improvement]

#### BEFORE Results
**Date**: [DATE]
**Time**: [TIME]
**Session**: [Claude Code session ID]

**Files Read**:
- [List of files]

**Tools Used**:
- [List of tools]

**Code Generated**:
[Summary of code]

**Time Taken**: [X seconds]

**Correctness**: [Correct/Partially Correct/Incorrect]

**Followed Patterns**: [Yes/No/Partially]

**Issues/Errors**:
- [List any issues]

**Overall Quality**: [Rating 1-10]

**Notes**:
[Additional observations]

#### AFTER Results
**Date**: [DATE]
**Time**: [TIME]
**Session**: [Claude Code session ID]

**Files Read**:
- [List of files]

**Tools Used**:
- [List of tools]

**Code Generated**:
[Summary of code]

**Time Taken**: [X seconds]

**Correctness**: [Correct/Partially Correct/Incorrect]

**Followed Patterns**: [Yes/No/Partially]

**Issues/Errors**:
- [List any issues]

**Overall Quality**: [Rating 1-10]

**Notes**:
[Additional observations]

#### Comparison

| Metric | BEFORE | AFTER | Difference |
|--------|--------|-------|------------|
| Files Read | [N] | [N] | [+/- N] |
| Tools Used | [N] | [N] | [+/- N] |
| Time Taken | [X s] | [X s] | [+/- X s] |
| Correctness | [N/10] | [N/10] | [+/- N] |
| Pattern Compliance | [N/10] | [N/10] | [+/- N] |
| Overall Quality | [N/10] | [N/10] | [+/- N] |

#### Impact Assessment

**Improvement**: [Name of improvement]

**Positive Changes**:
- [List positive changes]

**Negative Changes**:
- [List negative changes if any]

**Neutral/No Change**:
- [List things that didn't change]

**Overall Impact**: [🔥 HIGH / 🟡 MEDIUM / 🟢 LOW / ❌ NONE]

**Recommendation**: [Keep / Remove / Modify]

**Reasoning**:
[Explain why you made this recommendation]

#### Additional Tests (if needed)
If the first test was inconclusive, run one more test case to validate.

## Test Cases

The following test cases will be run:

1. **test1_component_generation** - Generate a new page component
2. **test2_firebase_integration** - Add Firebase field to baby profile
3. **test3_media_upload** - Create media upload component
4. **test4_age_calculation** - Create age display utility
5. **test5_testing_setup** - Create tests for existing component
6. **test6_i18n_integration** - Add translation keys for new feature
7. **test7_component_patterns** - Create reusable layout component

Each test will be run for each major improvement:

### Improvements to Test

1. **CLAUDE.md** - Project memory file
2. **react-typescript skill** - React/TypeScript patterns
3. **testing skill** - Testing patterns
4. **pwa-specific skill** - Domain patterns
5. **i18n skill** - i18n patterns
6. **firebase skill** - Firebase patterns
7. **component-patterns skill** - Component patterns
8. **debugging skill** - Debugging methodology
9. **pwa-code-reviewer agent** - Code review automation
10. **Development commands** - Slash commands
11. **settings.json hooks** - Automation
12. **GitHub Actions** - CI/CD workflow

## Running the Tests

For each improvement:
1. Run test1 with BEFORE baseline
2. Apply improvement
3. Run test1 with AFTER
4. Analyze results
5. If needed, run additional tests
6. Document findings

After all improvements are tested:
1. Create summary report
2. Rank improvements by impact
3. Provide recommendations

## Success Criteria

An improvement is considered **HIGH IMPACT** if:
- Significantly reduces time to complete tasks (>30% faster)
- Improves code quality or correctness by >20%
- Prevents common errors or mistakes
- Enables new capabilities that weren't possible before

An improvement is considered **MEDIUM IMPACT** if:
- Moderately reduces time to complete tasks (10-30% faster)
- Improves code quality by 10-20%
- Helps catch some errors
- Provides useful but non-critical capabilities

An improvement is considered **LOW IMPACT** if:
- Slightly improves speed (<10% faster)
- Minor quality improvements (<10%)
- Nice to have but not essential

An improvement is considered **NO IMPACT** if:
- No measurable difference in speed, quality, or capabilities
- Makes things worse
- Introduces new problems
