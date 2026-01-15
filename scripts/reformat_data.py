import openpyxl
from copy import copy

# Configuration
input_file = 'DCF 1 CALLS- Savindi.xlsx'
output_file = 'reformatted_data.xlsx'

# Column Indices (0-based)
PREFIX_LEN = 70
BLOCK_SIZE = 32
NUM_BLOCKS = 15
# Within each block of 32, we only want the first 11 columns
KEEP_BLOCK_LEN = 11

SUFFIX_START_INDEX = 70 + (BLOCK_SIZE * NUM_BLOCKS)

def reformat_excel():
    print(f"Loading {input_file}...")
    try:
        wb = openpyxl.load_workbook(input_file)
        sheet = wb.active
    except Exception as e:
        print(f"Failed to load workbook: {e}")
        return

    new_wb = openpyxl.Workbook()
    new_sheet = new_wb.active
    new_sheet.title = "Reformatted Data"

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        print("No data found.")
        return

    original_header = rows[0]
    
    # Construct New Header
    # Prefix + Clean Block 1 Headers + Suffix
    prefix_header = list(original_header[:PREFIX_LEN])
    block_header = list(original_header[70:70+KEEP_BLOCK_LEN])
    suffix_header = list(original_header[SUFFIX_START_INDEX:])
    
    new_header = prefix_header + block_header + suffix_header
    new_sheet.append(new_header)

    print(f"Original Row Count: {len(rows)}")
    
    generated_rows = 0

    for row_idx, row in enumerate(rows[1:], start=2): # Start from row 2
        prefix_data = list(row[:PREFIX_LEN])
        suffix_data = list(row[SUFFIX_START_INDEX:])
        
        # Determine number of members from Column 69 (Index 69)
        # Value might be string or int
        try:
            num_members_val = row[69]
            if num_members_val is None:
                num_members = 0
            else:
                num_members = int(float(num_members_val))
        except ValueError:
            print(f"Row {row_idx}: Could not parse member count '{row[69]}'. Defaulting to 0.")
            num_members = 0
            
        # Create empty placeholders
        empty_prefix = [None] * len(prefix_data)
        empty_suffix = [None] * len(suffix_data)
        
        # If num_members is 0, we might still want to output the household row?
        # Requirement: "if members are 7 keep 7 rows". 
        # If 0 members (unlikely), strict reading suggests 0 rows.
        # But usually we'd want to keep the household info.
        # Let's assume minimum 1 row if num_members is 0 or absent to preserve data.
        loop_count = max(1, num_members)
        
        for i in range(loop_count):
            # Decide which prefix/suffix to use
            if i == 0:
                curr_prefix = prefix_data
                curr_suffix = suffix_data
            else:
                curr_prefix = empty_prefix
                curr_suffix = empty_suffix
                
            # Extract block data
            if i < NUM_BLOCKS:
                start = 70 + (i * BLOCK_SIZE)
                end_keep = start + KEEP_BLOCK_LEN
                block_data = list(row[start:end_keep])
            else:
                # If member count exceeds columns (unlikely), pad with None
                block_data = [None] * KEEP_BLOCK_LEN
            
            new_row = list(curr_prefix) + list(block_data) + list(curr_suffix)
            new_sheet.append(new_row)
            generated_rows += 1
        
    print(f"Generated {generated_rows} new rows.")
    new_wb.save(output_file)
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    reformat_excel()
