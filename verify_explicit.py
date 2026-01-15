import openpyxl

file_path = 'reformatted_data.xlsx'

try:
    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active
    
    rows = list(sheet.iter_rows(values_only=True))
    headers = rows[0]
    
    # Verify Column Headers
    # Col BR (Index 69) is 'Number of household members'
    # Col BS (Index 70) is '11.1 Household Chief occupant ID'
    # Col... Clean block should be 11 cols.
    # So Index 70+10 = 80 is last block col ('11.1.7 Did you ever have a stroke ?')
    # Index 81 Should be Suffix start ('12. Any death...')
    
    col_80 = headers[80]
    col_81 = headers[81]
    
    print(f"Col 80 (Last Member Col): {col_80}")
    print(f"Col 81 (Suffix Start)   : {col_81}")
    
    if "GN_ID" in str(col_80) or "GN_ID" in str(col_81):
        print("FAILURE: GN_ID columns still present around boundary.")
    else:
        print("SUCCESS: GN_ID columns appear removed.")
        
    print("-" * 20)
    
    # Verify Row Counts
    # Find a row where 'Number of household members' > 0
    # Let's count consecutive rows with same ID (Col 50 '5.Household ID' or just row grouping)
    # Since we blank out prefix for sub-members, we can just count rows until next non-empty prefix.
    
    current_prefix = None
    count = 0
    member_count_val = 0
    
    print("Checking Row Grouping logic:")
    
    for idx, row in enumerate(rows[1:], start=2):
        prefix_val = row[0] # date
        expected_count = row[69] # Num members column (only populate on first row)
        
        if prefix_val is not None:
            # New Group
            if count > 0:
                print(f"Previous Group: Wanted {member_count_val}, Got {count} -> {'MATCH' if member_count_val==count else 'MISMATCH'}")
            
            current_prefix = prefix_val
            member_count_val = int(expected_count) if expected_count else 0
            count = 1
        else:
            # Same group
            count += 1
            
    # Last group
    if count > 0:
         print(f"Last Group: Wanted {member_count_val}, Got {count} -> {'MATCH' if member_count_val==count else 'MISMATCH'}")


except Exception as e:
    print(f"Error: {e}")
